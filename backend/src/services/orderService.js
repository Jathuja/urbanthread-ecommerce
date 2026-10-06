const db = require('../config/db');

/**
 * Supported payment methods.
 */
const SUPPORTED_PAYMENT_METHODS = ['whatsapp', 'payhere', 'cash_on_delivery'];

/**
 * Create a new order inside a database transaction.
 *
 * Flow:
 *   1. Validate all product/variant references exist and belong together.
 *   2. Lock variant rows FOR UPDATE to prevent concurrent overselling.
 *   3. Re-check stock with locked rows.
 *   4. Calculate all prices server-side (never trust client prices).
 *   5. INSERT order row.
 *   6. INSERT order_items rows.
 *   7. Decrement variant stock.
 *   8. COMMIT — or ROLLBACK on any failure.
 *
 * @param {Object} orderData
 * @param {Object} orderData.customer
 * @param {Array}  orderData.items
 * @param {string} orderData.paymentMethod
 * @returns {Object} Created order summary
 */
async function createOrder(orderData) {
  const { customer, items, paymentMethod } = orderData;

  // Get a dedicated connection so we can run a transaction
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // ---- Step 1 & 2: Validate each item, lock rows ----
    const resolvedItems = [];

    for (const item of items) {
      const productId = parseInt(item.productId, 10);
      const variantId = parseInt(item.variantId, 10);
      const quantity  = parseInt(item.quantity,  10);

      // Fetch product (server-side price)
      const [productRows] = await conn.query(
        'SELECT id, name, price FROM products WHERE id = ?',
        [productId]
      );
      if (productRows.length === 0) {
        const err = new Error(`Product not found: productId ${productId}`);
        err.statusCode = 404;
        throw err;
      }
      const product = productRows[0];

      // Fetch variant with FOR UPDATE lock to prevent concurrent overselling
      const [variantRows] = await conn.query(
        `SELECT id, product_id, size, colour, stock
         FROM product_variants
         WHERE id = ? AND product_id = ?
         FOR UPDATE`,
        [variantId, productId]
      );
      if (variantRows.length === 0) {
        const err = new Error(
          `Variant not found or does not belong to product: variantId ${variantId}, productId ${productId}`
        );
        err.statusCode = 404;
        throw err;
      }
      const variant = variantRows[0];

      // ---- Step 3: Stock check (with locked row) ----
      if (variant.stock < quantity) {
        const err = new Error(
          `Insufficient stock for variant ${variantId} (${variant.size}/${variant.colour}). ` +
          `Requested: ${quantity}, Available: ${variant.stock}`
        );
        err.statusCode = 409;
        throw err;
      }

      const unitPrice    = parseFloat(product.price);
      const itemSubtotal = parseFloat((unitPrice * quantity).toFixed(2));

      resolvedItems.push({
        productId,
        variantId,
        productName: product.name,
        size:        variant.size,
        colour:      variant.colour,
        unitPrice,
        quantity,
        subtotal:    itemSubtotal,
        // Keep reference to variant for stock decrement
        currentStock: variant.stock,
      });
    }

    // ---- Step 4: Calculate order totals server-side ----
    const subtotal    = parseFloat(
      resolvedItems.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2)
    );
    const deliveryFee = 0.00;   // Not implemented yet
    const total       = parseFloat((subtotal + deliveryFee).toFixed(2));

    // ---- Step 5: INSERT order ----
    const [orderResult] = await conn.query(
      `INSERT INTO orders
         (customer_name, customer_email, customer_phone,
          shipping_address, shipping_city, notes,
          subtotal, delivery_fee, total,
          payment_method, payment_status, order_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
      [
        customer.name.trim(),
        customer.email.trim().toLowerCase(),
        customer.phone.trim(),
        customer.address.trim(),
        customer.city.trim(),
        customer.notes ? customer.notes.trim() : null,
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
      ]
    );
    const orderId = orderResult.insertId;

    // ---- Step 6: INSERT order_items ----
    for (const item of resolvedItems) {
      await conn.query(
        `INSERT INTO order_items
           (order_id, product_id, variant_id,
            product_name, size, colour,
            unit_price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.variantId,
          item.productName,
          item.size,
          item.colour,
          item.unitPrice,
          item.quantity,
          item.subtotal,
        ]
      );
    }

    // ---- Step 7: Decrement variant stock ----
    for (const item of resolvedItems) {
      await conn.query(
        `UPDATE product_variants
         SET stock = stock - ?
         WHERE id = ? AND stock >= ?`,
        [item.quantity, item.variantId, item.quantity]
      );

      // Double-check the row was actually updated (concurrent protection)
      const [checkRows] = await conn.query(
        'SELECT stock FROM product_variants WHERE id = ?',
        [item.variantId]
      );
      if (checkRows.length === 0 || checkRows[0].stock < 0) {
        const err = new Error(
          `Stock integrity check failed for variantId ${item.variantId}. Rolling back.`
        );
        err.statusCode = 409;
        throw err;
      }
    }

    // ---- Step 8: COMMIT ----
    await conn.commit();

    return {
      orderId,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        city: customer.city.trim(),
        notes: customer.notes ? customer.notes.trim() : null,
      },
      items: resolvedItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        size: item.size,
        colour: item.colour,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus:   'pending',
    };
  } catch (err) {
    // ROLLBACK on any failure — no partial order remains
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Retrieve an order and its items by order ID.
 *
 * @param {number} id - Order ID
 * @returns {Object|null} Order with items, or null if not found
 */
async function getOrderById(id) {
  const [orderRows] = await db.query(
    `SELECT
       id,
       customer_name,
       customer_email,
       customer_phone,
       shipping_address,
       shipping_city,
       notes,
       subtotal,
       delivery_fee,
       total,
       payment_method,
       payment_status,
       order_status,
       created_at,
       updated_at
     FROM orders
     WHERE id = ?`,
    [id]
  );

  if (orderRows.length === 0) {
    return null;
  }

  const order = orderRows[0];

  const [itemRows] = await db.query(
    `SELECT
       id,
       product_id,
       variant_id,
       product_name,
       size,
       colour,
       unit_price,
       quantity,
       subtotal
     FROM order_items
     WHERE order_id = ?
     ORDER BY id ASC`,
    [id]
  );

  return {
    id:             order.id,
    customer: {
      name:    order.customer_name,
      email:   order.customer_email,
      phone:   order.customer_phone,
      address: order.shipping_address,
      city:    order.shipping_city,
      notes:   order.notes,
    },
    subtotal:      parseFloat(order.subtotal),
    deliveryFee:   parseFloat(order.delivery_fee),
    total:         parseFloat(order.total),
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    orderStatus:   order.order_status,
    createdAt:     order.created_at,
    updatedAt:     order.updated_at,
    items: itemRows.map((item) => ({
      id:          item.id,
      productId:   item.product_id,
      variantId:   item.variant_id,
      productName: item.product_name,
      size:        item.size,
      colour:      item.colour,
      unitPrice:   parseFloat(item.unit_price),
      quantity:    item.quantity,
      subtotal:    parseFloat(item.subtotal),
    })),
  };
}

module.exports = {
  createOrder,
  getOrderById,
  SUPPORTED_PAYMENT_METHODS,
};
