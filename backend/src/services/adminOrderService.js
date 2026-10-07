const db = require('../config/db');

/**
 * Valid order status values from database ENUM schema:
 * ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
 */
const VALID_ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

/**
 * Valid status transitions state machine:
 * - 'delivered' is a terminal state (cannot transition back to active stages)
 * - 'cancelled' is a terminal state (cannot transition back to active stages)
 */
const ALLOWED_TRANSITIONS = {
  pending: ['pending', 'confirmed', 'processing', 'cancelled'],
  confirmed: ['confirmed', 'processing', 'shipped', 'cancelled'],
  processing: ['processing', 'shipped', 'delivered', 'cancelled'],
  shipped: ['shipped', 'delivered', 'cancelled'],
  delivered: ['delivered'], // Terminal state
  cancelled: ['cancelled'], // Terminal state
};

/**
 * Fetch all orders for admin panel with optional filters:
 * - search: keyword matched against order ID, customer name, email, or phone
 * - order_status: filter by specific order status
 * - payment_status: filter by payment status
 * - payment_method: filter by payment method
 */
async function getAdminOrders(filters = {}) {
  const { search, order_status, payment_status, payment_method } = filters;

  const whereClauses = [];
  const params = [];

  // Search filter
  if (search && search.trim() !== '') {
    const rawSearch = search.trim();
    const isNum = Number.isInteger(Number(rawSearch)) && Number(rawSearch) > 0;

    if (isNum) {
      whereClauses.push('(o.id = ? OR o.customer_name LIKE ? OR o.customer_email LIKE ? OR o.customer_phone LIKE ?)');
      params.push(Number(rawSearch), `%${rawSearch}%`, `%${rawSearch}%`, `%${rawSearch}%`);
    } else {
      whereClauses.push('(o.customer_name LIKE ? OR o.customer_email LIKE ? OR o.customer_phone LIKE ?)');
      params.push(`%${rawSearch}%`, `%${rawSearch}%`, `%${rawSearch}%`);
    }
  }

  // Order status filter
  if (order_status && order_status.trim() !== '' && order_status !== 'all') {
    whereClauses.push('o.order_status = ?');
    params.push(order_status.trim().toLowerCase());
  }

  // Payment status filter
  if (payment_status && payment_status.trim() !== '' && payment_status !== 'all') {
    whereClauses.push('o.payment_status = ?');
    params.push(payment_status.trim().toLowerCase());
  }

  // Payment method filter
  if (payment_method && payment_method.trim() !== '' && payment_method !== 'all') {
    whereClauses.push('o.payment_method = ?');
    params.push(payment_method.trim().toLowerCase());
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const sql = `
    SELECT
      o.id,
      o.user_id,
      o.customer_name,
      o.customer_email,
      o.customer_phone,
      o.shipping_address,
      o.shipping_city,
      o.notes,
      o.subtotal,
      o.delivery_fee,
      o.total,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.created_at,
      o.updated_at
    FROM orders o
    ${whereSQL}
    ORDER BY o.created_at DESC, o.id DESC
  `;

  const [orders] = await db.query(sql, params);

  if (orders.length === 0) {
    return [];
  }

  const orderIds = orders.map((o) => o.id);

  // Fetch items for all returned orders
  const [items] = await db.query(
    `SELECT
       id,
       order_id,
       product_id,
       variant_id,
       product_name,
       size,
       colour,
       unit_price,
       quantity,
       subtotal
     FROM order_items
     WHERE order_id IN (?)
     ORDER BY id ASC`,
    [orderIds]
  );

  const itemsMap = {};
  for (const item of items) {
    if (!itemsMap[item.order_id]) {
      itemsMap[item.order_id] = [];
    }
    itemsMap[item.order_id].push({
      id: item.id,
      productId: item.product_id,
      variantId: item.variant_id,
      productName: item.product_name,
      size: item.size,
      colour: item.colour,
      unitPrice: parseFloat(item.unit_price),
      quantity: item.quantity,
      subtotal: parseFloat(item.subtotal),
    });
  }

  return orders.map((o) => {
    const orderItems = itemsMap[o.id] || [];
    const itemCount = orderItems.reduce((acc, it) => acc + it.quantity, 0);

    return {
      id: o.id,
      userId: o.user_id,
      customer: {
        name: o.customer_name,
        email: o.customer_email,
        phone: o.customer_phone,
        address: o.shipping_address,
        city: o.shipping_city,
        notes: o.notes,
      },
      subtotal: parseFloat(o.subtotal),
      deliveryFee: parseFloat(o.delivery_fee),
      total: parseFloat(o.total),
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      orderStatus: o.order_status,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      itemCount,
      items: orderItems,
    };
  });
}

/**
 * Fetch a single order by ID for admin
 */
async function getAdminOrderById(id) {
  const [orders] = await db.query(
    `SELECT
       o.id,
       o.user_id,
       o.customer_name,
       o.customer_email,
       o.customer_phone,
       o.shipping_address,
       o.shipping_city,
       o.notes,
       o.subtotal,
       o.delivery_fee,
       o.total,
       o.payment_method,
       o.payment_status,
       o.order_status,
       o.created_at,
       o.updated_at
     FROM orders o
     WHERE o.id = ?`,
    [id]
  );

  if (orders.length === 0) {
    return null;
  }

  const o = orders[0];

  const [items] = await db.query(
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

  const orderItems = items.map((item) => ({
    id: item.id,
    productId: item.product_id,
    variantId: item.variant_id,
    productName: item.product_name,
    size: item.size,
    colour: item.colour,
    unitPrice: parseFloat(item.unit_price),
    quantity: item.quantity,
    subtotal: parseFloat(item.subtotal),
  }));

  const itemCount = orderItems.reduce((acc, it) => acc + it.quantity, 0);

  return {
    id: o.id,
    userId: o.user_id,
    customer: {
      name: o.customer_name,
      email: o.customer_email,
      phone: o.customer_phone,
      address: o.shipping_address,
      city: o.shipping_city,
      notes: o.notes,
    },
    subtotal: parseFloat(o.subtotal),
    deliveryFee: parseFloat(o.delivery_fee),
    total: parseFloat(o.total),
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
    orderStatus: o.order_status,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    itemCount,
    items: orderItems,
  };
}

/**
 * Update the fulfillment / order status of an order.
 *
 * Enforces:
 * 1. Valid order status value.
 * 2. Safe transition lifecycle rules (e.g. Delivered and Cancelled cannot transition back).
 * 3. Strict payment status protection: payment_status is NEVER updated through this API.
 */
async function updateOrderStatus(id, newStatus) {
  const normalizedStatus = (newStatus || '').trim().toLowerCase();

  if (!VALID_ORDER_STATUSES.includes(normalizedStatus)) {
    const err = new Error(
      `Invalid order status "${newStatus}". Must be one of: ${VALID_ORDER_STATUSES.join(', ')}`
    );
    err.statusCode = 400;
    throw err;
  }

  const [rows] = await db.query(
    'SELECT id, order_status, payment_status, payment_method FROM orders WHERE id = ?',
    [id]
  );

  if (rows.length === 0) {
    const err = new Error(`Order with ID ${id} not found`);
    err.statusCode = 404;
    throw err;
  }

  const current = rows[0];
  const currentStatus = current.order_status;

  // Idempotent update: if same status, return order directly
  if (currentStatus === normalizedStatus) {
    return await getAdminOrderById(id);
  }

  // Check state machine transitions
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(normalizedStatus)) {
    const err = new Error(
      `Invalid status transition from "${currentStatus}" to "${normalizedStatus}". Orders in "${currentStatus}" status cannot be transitioned to "${normalizedStatus}".`
    );
    err.statusCode = 400;
    throw err;
  }

  // Update order_status only — payment_status and other historical fields remain completely untouched
  await db.query(
    'UPDATE orders SET order_status = ? WHERE id = ?',
    [normalizedStatus, id]
  );

  return await getAdminOrderById(id);
}

module.exports = {
  getAdminOrders,
  getAdminOrderById,
  updateOrderStatus,
  VALID_ORDER_STATUSES,
  ALLOWED_TRANSITIONS,
};
