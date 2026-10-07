const BASE_URL = 'http://localhost:5001/api';

async function runTests() {
  console.log('--- Starting UrbanThread API Test Suite ---\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`FAIL: ${name}`);
      console.error(`      Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('GET /api/health', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (!res.ok || !data.success || data.message !== 'UrbanThread API is running') {
      throw new Error(`Unexpected health payload: ${JSON.stringify(data)}`);
    }
  });

  // 2. Categories
  await test('GET /api/categories', async () => {
    const res = await fetch(`${BASE_URL}/categories`);
    const data = await res.json();
    if (!res.ok || !data.success || !Array.isArray(data.data) || data.data.length !== 3) {
      throw new Error(`Expected 3 categories, got ${data.count}`);
    }
  });

  // 3. Products
  await test('GET /api/products', async () => {
    const res = await fetch(`${BASE_URL}/products`);
    const data = await res.json();
    if (!res.ok || !data.success || data.data.length !== 12) {
      throw new Error(`Expected 12 products, got ${data.data.length}`);
    }
    const first = data.data[0];
    if (!first.variants || first.variants.length === 0 || !first.category) {
      throw new Error('Product is missing variants or category');
    }
  });

  // 4. Product by ID
  await test('GET /api/products/1', async () => {
    const res = await fetch(`${BASE_URL}/products/1`);
    const data = await res.json();
    if (!res.ok || !data.success || data.data.id !== 1 || !data.data.name) {
      throw new Error(`Product 1 lookup failed`);
    }
  });

  // 5. Search filter (search=tshirt)
  await test('GET /api/products?search=tshirt', async () => {
    const res = await fetch(`${BASE_URL}/products?search=tshirt`);
    const data = await res.json();
    if (!res.ok || data.data.length < 2) {
      throw new Error(`Expected at least 2 t-shirts, got ${data.data?.length}`);
    }
  });

  // 6. Category filter (category=Men)
  await test('GET /api/products?category=Men', async () => {
    const res = await fetch(`${BASE_URL}/products?category=Men`);
    const data = await res.json();
    if (!res.ok || data.data.length !== 7) {
      throw new Error(`Expected 7 Men products, got ${data.data?.length}`);
    }
  });

  // 7. Size filter (size=M)
  await test('GET /api/products?size=M', async () => {
    const res = await fetch(`${BASE_URL}/products?size=M`);
    const data = await res.json();
    if (!res.ok || data.data.length !== 9) {
      throw new Error(`Expected 9 products with size M, got ${data.data?.length}`);
    }
  });

  // 8. Colour filter (colour=Black)
  await test('GET /api/products?colour=Black', async () => {
    const res = await fetch(`${BASE_URL}/products?colour=Black`);
    const data = await res.json();
    if (!res.ok || data.data.length !== 8) {
      throw new Error(`Expected 8 products with colour Black, got ${data.data?.length}`);
    }
  });

  // 9. Price filter (minPrice=1000&maxPrice=5000)
  await test('GET /api/products?minPrice=1000&maxPrice=5000', async () => {
    const res = await fetch(`${BASE_URL}/products?minPrice=1000&maxPrice=5000`);
    const data = await res.json();
    if (!res.ok || data.data.length !== 6) {
      throw new Error(`Expected 6 products in price range [1000, 5000], got ${data.data?.length}`);
    }
    for (const p of data.data) {
      if (p.price < 1000 || p.price > 5000) {
        throw new Error(`Product ${p.name} price ${p.price} out of range`);
      }
    }
  });

  // 10. Combination filter (search=tshirt&size=M&colour=Black)
  await test('GET /api/products?search=tshirt&size=M&colour=Black', async () => {
    const res = await fetch(`${BASE_URL}/products?search=tshirt&size=M&colour=Black`);
    const data = await res.json();
    if (!res.ok || data.data.length !== 2) {
      throw new Error(`Expected 2 items, got ${data.data?.length}`);
    }
  });

  // 11. Invalid product ID (non-existent -> 404)
  await test('GET /api/products/999 (404 Not Found)', async () => {
    const res = await fetch(`${BASE_URL}/products/999`);
    const data = await res.json();
    if (res.status !== 404 || data.success !== false) {
      throw new Error(`Expected 404 Not Found, got ${res.status}`);
    }
  });

  // 12. Invalid product ID format (non-integer -> 400)
  await test('GET /api/products/abc (400 Bad Request)', async () => {
    const res = await fetch(`${BASE_URL}/products/abc`);
    const data = await res.json();
    if (res.status !== 400 || data.success !== false) {
      throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    }
  });

  // 13. Invalid price parameters (minPrice > maxPrice -> 400)
  await test('GET /api/products?minPrice=5000&maxPrice=1000 (400 Bad Request)', async () => {
    const res = await fetch(`${BASE_URL}/products?minPrice=5000&maxPrice=1000`);
    const data = await res.json();
    if (res.status !== 400 || data.success !== false) {
      throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    }
  });

  // 14. Create valid order (POST /api/orders -> 201)
  let createdOrderId = null;
  let testVariantId = null;
  let testProductId = null;
  let testProductPrice = null;
  let initialStock = null;

  await test('POST /api/orders (201 Created - valid order)', async () => {
    // Dynamically retrieve product 1 and its first variant
    const pRes = await fetch(`${BASE_URL}/products/1`);
    const pData = await pRes.json();
    testProductId = pData.data.id;
    testProductPrice = parseFloat(pData.data.price);
    testVariantId = pData.data.variants[0].id;
    initialStock = pData.data.variants[0].stock;

    const payload = {
      customer: {
        name: 'Kasun Perera',
        email: 'kasun.perera@example.com',
        phone: '+94 77 123 4567',
        address: 'No 45, Galle Road, Bambalapitiya',
        city: 'Colombo',
        notes: 'Please leave at reception',
      },
      items: [
        {
          productId: testProductId,
          variantId: testVariantId,
          quantity: 2,
        },
      ],
      paymentMethod: 'cash_on_delivery',
    };

    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.status !== 201 || !data.success) {
      throw new Error(`Failed to create order: ${JSON.stringify(data)}`);
    }

    if (!data.data.orderId || data.data.subtotal !== testProductPrice * 2 || data.data.total !== testProductPrice * 2) {
      throw new Error(`Unexpected order calculation: ${JSON.stringify(data.data)}`);
    }

    if (data.data.paymentMethod !== 'cash_on_delivery' || data.data.paymentStatus !== 'pending' || data.data.orderStatus !== 'pending') {
      throw new Error(`Unexpected status flags: ${JSON.stringify(data.data)}`);
    }

    createdOrderId = data.data.orderId;
  });

  // 15. Verify stock decrement after order
  await test('Verify variant stock decremented by ordered quantity', async () => {
    const pRes = await fetch(`${BASE_URL}/products/${testProductId}`);
    const pData = await pRes.json();
    const updatedVariant = pData.data.variants.find((v) => v.id === testVariantId);

    if (!updatedVariant) {
      throw new Error('Variant not found on product');
    }

    if (updatedVariant.stock !== initialStock - 2) {
      throw new Error(`Expected stock ${initialStock - 2}, but got ${updatedVariant.stock}`);
    }
  });

  // 16. Get order by ID (GET /api/orders/:id -> 200)
  await test('GET /api/orders/:id (200 OK - retrieve order with items)', async () => {
    const res = await fetch(`${BASE_URL}/orders/${createdOrderId}`);
    const data = await res.json();

    if (res.status !== 200 || !data.success) {
      throw new Error(`Failed to get order: ${JSON.stringify(data)}`);
    }

    const order = data.data;
    if (order.id !== createdOrderId || order.customer.name !== 'Kasun Perera' || order.customer.email !== 'kasun.perera@example.com') {
      throw new Error(`Customer details mismatch: ${JSON.stringify(order.customer)}`);
    }

    if (!Array.isArray(order.items) || order.items.length !== 1) {
      throw new Error(`Expected 1 order item, got ${order.items?.length}`);
    }

    const item = order.items[0];
    if (item.productId !== testProductId || item.variantId !== testVariantId || item.quantity !== 2) {
      throw new Error(`Order item details mismatch: ${JSON.stringify(item)}`);
    }
    if (item.unitPrice !== testProductPrice || item.subtotal !== testProductPrice * 2) {
      throw new Error(`Order item price mismatch: ${JSON.stringify(item)}`);
    }
  });

  // 17. Validation: Empty items array (400)
  await test('POST /api/orders with empty items (400 Bad Request)', async () => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+94 71 234 5678',
          address: '123 Flower Road',
          city: 'Colombo',
        },
        items: [],
        paymentMethod: 'whatsapp',
      }),
    });
    const data = await res.json();
    if (res.status !== 400 || data.success !== false) {
      throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    }
  });

  // 18. Validation: Missing customer name & invalid email (400)
  await test('POST /api/orders with invalid customer fields (400 Bad Request)', async () => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: '',
          email: 'invalid-email',
          phone: '123',
          address: 'short',
          city: '',
        },
        items: [{ productId: 1, variantId: 1, quantity: 1 }],
        paymentMethod: 'payhere',
      }),
    });
    const data = await res.json();
    if (res.status !== 400 || data.success !== false || !Array.isArray(data.errors)) {
      throw new Error(`Expected 400 with errors array, got ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  // 19. Validation: Invalid payment method (400)
  await test('POST /api/orders with invalid paymentMethod (400 Bad Request)', async () => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+94 71 234 5678',
          address: '123 Flower Road',
          city: 'Colombo',
        },
        items: [{ productId: 1, variantId: 1, quantity: 1 }],
        paymentMethod: 'bitcoin',
      }),
    });
    const data = await res.json();
    if (res.status !== 400 || data.success !== false) {
      throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    }
  });

  // 20. Validation: Non-existent product ID (404)
  await test('POST /api/orders with non-existent productId (404 Not Found)', async () => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+94 71 234 5678',
          address: '123 Flower Road',
          city: 'Colombo',
        },
        items: [{ productId: 9999, variantId: 1, quantity: 1 }],
        paymentMethod: 'whatsapp',
      }),
    });
    const data = await res.json();
    if (res.status !== 404 || data.success !== false) {
      throw new Error(`Expected 404 Not Found, got ${res.status}`);
    }
  });

  // 21. Validation: Non-existent variant ID (404)
  await test('POST /api/orders with non-existent variantId (404 Not Found)', async () => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+94 71 234 5678',
          address: '123 Flower Road',
          city: 'Colombo',
        },
        items: [{ productId: 1, variantId: 99999, quantity: 1 }],
        paymentMethod: 'whatsapp',
      }),
    });
    const data = await res.json();
    if (res.status !== 404 || data.success !== false) {
      throw new Error(`Expected 404 Not Found, got ${res.status}`);
    }
  });

  // 22. Validation: Variant belonging to another product (404)
  await test('POST /api/orders with mismatched product/variant (404 Not Found)', async () => {
    // Product 2 has variants that do not belong to Product 1
    const p2Res = await fetch(`${BASE_URL}/products/2`);
    const p2Data = await p2Res.json();
    const p2VariantId = p2Data.data.variants[0].id;

    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+94 71 234 5678',
          address: '123 Flower Road',
          city: 'Colombo',
        },
        items: [{ productId: 1, variantId: p2VariantId, quantity: 1 }],
        paymentMethod: 'whatsapp',
      }),
    });
    const data = await res.json();
    if (res.status !== 404 || data.success !== false) {
      throw new Error(`Expected 404 Not Found, got ${res.status}`);
    }
  });

  // 23. Validation: Quantity 0 or negative (400)
  await test('POST /api/orders with quantity <= 0 (400 Bad Request)', async () => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+94 71 234 5678',
          address: '123 Flower Road',
          city: 'Colombo',
        },
        items: [{ productId: 1, variantId: 1, quantity: 0 }],
        paymentMethod: 'whatsapp',
      }),
    });
    const data = await res.json();
    if (res.status !== 400 || data.success !== false) {
      throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    }
  });

  // 24. Validation: Insufficient stock (409 Conflict)
  await test('POST /api/orders with quantity exceeding available stock (409 Conflict)', async () => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+94 71 234 5678',
          address: '123 Flower Road',
          city: 'Colombo',
        },
        items: [{ productId: testProductId, variantId: testVariantId, quantity: 99999 }],
        paymentMethod: 'whatsapp',
      }),
    });
    const data = await res.json();
    if (res.status !== 409 || data.success !== false) {
      throw new Error(`Expected 409 Conflict, got ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  // 25. GET /api/orders/99999 -> 404
  await test('GET /api/orders/99999 (404 Not Found)', async () => {
    const res = await fetch(`${BASE_URL}/orders/99999`);
    const data = await res.json();
    if (res.status !== 404 || data.success !== false) {
      throw new Error(`Expected 404 Not Found, got ${res.status}`);
    }
  });

  // 26. GET /api/orders/abc -> 400
  await test('GET /api/orders/abc (400 Bad Request)', async () => {
    const res = await fetch(`${BASE_URL}/orders/abc`);
    const data = await res.json();
    if (res.status !== 400 || data.success !== false) {
      throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    }
  });

  // =========================================================================
  // PayHere Tests (27–35)
  // =========================================================================
  // These tests rely on the sandbox credentials configured in .env:
  //   PAYHERE_MERCHANT_ID=1220000
  //   PAYHERE_MERCHANT_SECRET=sandbox_merchant_secret_urbanthread
  //
  // Two signature formulas are used by PayHere:
  //
  // 1. Checkout hash (payment initiation):
  //    hash = UPPER(md5(merchant_id + order_id + amount + currency + UPPER(md5(secret))))
  //
  // 2. IPN notification signature (payhereService.verifyNotificationSignature):
  //    md5sig = UPPER(md5(merchant_id + order_id + amount + currency + status_code + UPPER(md5(secret))))
  //
  // Note: status_code is included in the IPN formula but NOT in the checkout hash.
  // =========================================================================

  const crypto = await import('crypto');
  const MERCHANT_ID = '1220000';
  const MERCHANT_SECRET = 'sandbox_merchant_secret_urbanthread';

  /**
   * Helper – compute the IPN notification md5sig exactly as payhereService.verifyNotificationSignature does.
   * Formula: UPPER(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + UPPER(md5(merchant_secret))))
   */
  function computeIpnSig(merchantId, orderId, amount, currency, statusCode, secret) {
    const upper = (s) => crypto.createHash('md5').update(String(s)).digest('hex').toUpperCase();
    const hashedSecret = upper(secret);
    const raw = `${merchantId}${orderId}${amount}${currency}${statusCode}${hashedSecret}`;
    return upper(raw);
  }

  // 27. GET /api/orders/:id/payhere-params — valid order should return params + hash
  await test('GET /api/orders/:id/payhere-params (200 OK - returns PayHere params)', async () => {
    if (!createdOrderId) throw new Error('Prerequisite: createdOrderId not set (test 14 failed)');
    const res = await fetch(`${BASE_URL}/orders/${createdOrderId}/payhere-params`);
    const data = await res.json();
    if (res.status !== 200 || !data.success) {
      throw new Error(`Expected 200 OK, got ${res.status}: ${JSON.stringify(data)}`);
    }
    const p = data.data;
    if (!p.isConfigured) {
      throw new Error(`PayHere reported not configured: ${JSON.stringify(p)}`);
    }
    if (!p.params || !p.params.merchant_id || !p.params.hash || !p.params.amount) {
      throw new Error(`Missing required PayHere params fields: ${JSON.stringify(p.params)}`);
    }
    if (p.params.merchant_id !== MERCHANT_ID) {
      throw new Error(`Merchant ID mismatch: expected ${MERCHANT_ID}, got ${p.params.merchant_id}`);
    }
    if (!p.checkoutUrl || !p.checkoutUrl.includes('payhere.lk')) {
      throw new Error(`Invalid checkoutUrl: ${p.checkoutUrl}`);
    }
  });

  // 28. GET /api/orders/99999/payhere-params — non-existent order (404)
  await test('GET /api/orders/99999/payhere-params (404 Not Found)', async () => {
    const res = await fetch(`${BASE_URL}/orders/99999/payhere-params`);
    const data = await res.json();
    if (res.status !== 404 || data.success !== false) {
      throw new Error(`Expected 404 Not Found, got ${res.status}`);
    }
  });

  // 29. GET /api/orders/abc/payhere-params — invalid ID format (400)
  await test('GET /api/orders/abc/payhere-params (400 Bad Request)', async () => {
    const res = await fetch(`${BASE_URL}/orders/abc/payhere-params`);
    const data = await res.json();
    if (res.status !== 400 || data.success !== false) {
      throw new Error(`Expected 400 Bad Request, got ${res.status}`);
    }
  });

  // 30. POST /api/orders/payhere-notify — missing required fields (400)
  await test('POST /api/orders/payhere-notify with missing fields (400 Bad Request)', async () => {
    const res = await fetch(`${BASE_URL}/orders/payhere-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ merchant_id: MERCHANT_ID }),
    });
    const data = await res.json();
    if (res.status !== 400 || data.success !== false) {
      throw new Error(`Expected 400 Bad Request, got ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  // 31. POST /api/orders/payhere-notify — invalid signature (400)
  await test('POST /api/orders/payhere-notify with invalid md5sig (400 Bad Request)', async () => {
    if (!createdOrderId) throw new Error('Prerequisite: createdOrderId not set (test 14 failed)');

    const orderRes = await fetch(`${BASE_URL}/orders/${createdOrderId}`);
    const orderData = await orderRes.json();
    const amount = parseFloat(orderData.data.total).toFixed(2);

    const res = await fetch(`${BASE_URL}/orders/payhere-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        merchant_id: MERCHANT_ID,
        order_id: String(createdOrderId),
        payment_id: 'PAY_INVALID_001',
        payhere_amount: amount,
        payhere_currency: 'LKR',
        status_code: '2',
        md5sig: 'INVALIDSIGNATURE000000000000000',
      }),
    });
    const data = await res.json();
    if (res.status !== 400 || data.success !== false) {
      throw new Error(`Expected 400 Bad Request for bad signature, got ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  // 32. POST /api/orders/payhere-notify — valid success notification (status_code=2)
  await test('POST /api/orders/payhere-notify valid success (200 OK - payment_status=paid)', async () => {
    if (!createdOrderId) throw new Error('Prerequisite: createdOrderId not set (test 14 failed)');

    const orderRes = await fetch(`${BASE_URL}/orders/${createdOrderId}`);
    const orderData = await orderRes.json();
    const amount = parseFloat(orderData.data.total).toFixed(2);
    const currency = 'LKR';
    const statusCode = '2';

    const md5sig = computeIpnSig(MERCHANT_ID, String(createdOrderId), amount, currency, statusCode, MERCHANT_SECRET);

    const res = await fetch(`${BASE_URL}/orders/payhere-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        merchant_id: MERCHANT_ID,
        order_id: String(createdOrderId),
        payment_id: 'PAY_SANDBOX_001',
        payhere_amount: amount,
        payhere_currency: currency,
        status_code: statusCode,
        md5sig,
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.success) {
      throw new Error(`Expected 200 OK for valid success notification, got ${res.status}: ${JSON.stringify(data)}`);
    }
    if (data.data.paymentStatus !== 'paid' || data.data.orderStatus !== 'processing') {
      throw new Error(`Expected paymentStatus=paid, orderStatus=processing. Got: ${JSON.stringify(data.data)}`);
    }
  });

  // 33. POST /api/orders/payhere-notify — duplicate paid notification (idempotency, 200 OK)
  await test('POST /api/orders/payhere-notify duplicate paid notification (200 OK - idempotent)', async () => {
    if (!createdOrderId) throw new Error('Prerequisite: createdOrderId not set (test 14 failed)');

    const orderRes = await fetch(`${BASE_URL}/orders/${createdOrderId}`);
    const orderData = await orderRes.json();
    const amount = parseFloat(orderData.data.total).toFixed(2);
    const currency = 'LKR';
    const statusCode = '2';

    const md5sig = computeIpnSig(MERCHANT_ID, String(createdOrderId), amount, currency, statusCode, MERCHANT_SECRET);

    const res = await fetch(`${BASE_URL}/orders/payhere-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        merchant_id: MERCHANT_ID,
        order_id: String(createdOrderId),
        payment_id: 'PAY_SANDBOX_001',
        payhere_amount: amount,
        payhere_currency: currency,
        status_code: statusCode,
        md5sig,
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.success) {
      throw new Error(`Expected 200 OK for duplicate notification, got ${res.status}: ${JSON.stringify(data)}`);
    }
    if (!data.message.toLowerCase().includes('duplicate') && !data.message.toLowerCase().includes('already')) {
      throw new Error(`Expected idempotency message, got: ${data.message}`);
    }
  });

  // 34. POST /api/orders/payhere-notify — failed payment (status_code=-1) on a new order
  let failOrderId = null;
  await test('POST /api/orders/payhere-notify failed payment (200 OK - payment_status=failed)', async () => {
    // Create a fresh order to set to failed (so we don't conflict with the paid order above)
    const pRes = await fetch(`${BASE_URL}/products/1`);
    const pData = await pRes.json();
    const variantId = pData.data.variants[0].id;

    const createRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: {
          name: 'Nimal Silva',
          email: 'nimal@example.com',
          phone: '+94 71 999 0000',
          address: '10 Kandy Road',
          city: 'Kandy',
        },
        items: [{ productId: 1, variantId, quantity: 1 }],
        paymentMethod: 'payhere',
      }),
    });
    const createData = await createRes.json();
    if (!createData.success) throw new Error(`Failed to create test order: ${JSON.stringify(createData)}`);
    failOrderId = createData.data.orderId;

    const amount = parseFloat(createData.data.total).toFixed(2);
    const currency = 'LKR';
    const statusCode = '-1';

    const md5sig = computeIpnSig(MERCHANT_ID, String(failOrderId), amount, currency, statusCode, MERCHANT_SECRET);

    const res = await fetch(`${BASE_URL}/orders/payhere-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        merchant_id: MERCHANT_ID,
        order_id: String(failOrderId),
        payment_id: 'PAY_SANDBOX_FAIL_001',
        payhere_amount: amount,
        payhere_currency: currency,
        status_code: statusCode,
        md5sig,
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.success) {
      throw new Error(`Expected 200 OK for failed payment, got ${res.status}: ${JSON.stringify(data)}`);
    }
    if (data.data.paymentStatus !== 'failed' || data.data.orderStatus !== 'cancelled') {
      throw new Error(`Expected paymentStatus=failed, orderStatus=cancelled. Got: ${JSON.stringify(data.data)}`);
    }
  });

  // 35. POST /api/orders/payhere-notify — amount mismatch (400)
  await test('POST /api/orders/payhere-notify with amount mismatch (400 Bad Request)', async () => {
    if (!createdOrderId) throw new Error('Prerequisite: createdOrderId not set (test 14 failed)');

    // Use a deliberately wrong amount (1.00) but generate hash with wrong amount too so sig passes
    const wrongAmount = '1.00';
    const currency = 'LKR';
    const statusCode = '2';

    const md5sig = computeIpnSig(MERCHANT_ID, String(createdOrderId), wrongAmount, currency, statusCode, MERCHANT_SECRET);

    const res = await fetch(`${BASE_URL}/orders/payhere-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        merchant_id: MERCHANT_ID,
        order_id: String(createdOrderId),
        payment_id: 'PAY_SANDBOX_MISMATCH',
        payhere_amount: wrongAmount,
        payhere_currency: currency,
        status_code: statusCode,
        md5sig,
      }),
    });
    const data = await res.json();
    if (res.status !== 400 || data.success !== false) {
      throw new Error(`Expected 400 for amount mismatch, got ${res.status}: ${JSON.stringify(data)}`);
    }
    if (!data.message.toLowerCase().includes('amount') && !data.message.toLowerCase().includes('mismatch')) {
      throw new Error(`Expected amount mismatch error message, got: ${data.message}`);
    }
  });

  // 36. GET /api/orders (200 OK - retrieve all orders)
  await test('GET /api/orders (200 OK - retrieve all orders list)', async () => {
    const res = await fetch(`${BASE_URL}/orders`);
    const data = await res.json();

    if (res.status !== 200 || !data.success) {
      throw new Error(`Expected 200 OK with success=true, got ${res.status}: ${JSON.stringify(data)}`);
    }

    if (!Array.isArray(data.data)) {
      throw new Error('Expected data to be an array of orders');
    }

    if (typeof data.count !== 'number' || data.count !== data.data.length) {
      throw new Error(`Expected count property to match array length (${data.data.length}), got ${data.count}`);
    }

    if (data.data.length === 0) {
      throw new Error('Expected at least one order from previous tests');
    }
  });

  // 37. GET /api/orders - verify order structure and sorting
  await test('GET /api/orders (verify order structure, customer info, and newest-first order)', async () => {
    const res = await fetch(`${BASE_URL}/orders`);
    const data = await res.json();
    const orders = data.data;

    // Check newest first
    for (let i = 0; i < orders.length - 1; i++) {
      if (orders[i].id < orders[i + 1].id) {
        throw new Error(`Orders not sorted newest first: order ${orders[i].id} came before ${orders[i + 1].id}`);
      }
    }

    // Check first order structure
    const order = orders[0];
    const requiredFields = ['id', 'customer', 'subtotal', 'deliveryFee', 'total', 'paymentMethod', 'paymentStatus', 'orderStatus', 'createdAt', 'items'];
    for (const field of requiredFields) {
      if (order[field] === undefined) {
        throw new Error(`Order missing required field: ${field}`);
      }
    }

    // Customer fields
    const custFields = ['name', 'email', 'phone', 'address', 'city'];
    for (const cf of custFields) {
      if (!order.customer[cf]) {
        throw new Error(`Order customer missing field: ${cf}`);
      }
    }

    // Numerical checks
    if (typeof order.total !== 'number' || typeof order.subtotal !== 'number' || typeof order.deliveryFee !== 'number') {
      throw new Error('Order pricing totals must be numeric');
    }
  });

  // 38. GET /api/orders - verify item details structure within orders
  await test('GET /api/orders (verify items array and item details inside orders)', async () => {
    const res = await fetch(`${BASE_URL}/orders`);
    const data = await res.json();
    const ordersWithItems = data.data.filter((o) => o.items && o.items.length > 0);

    if (ordersWithItems.length === 0) {
      throw new Error('Expected at least one order to have items');
    }

    const testItem = ordersWithItems[0].items[0];
    const itemFields = ['id', 'productId', 'variantId', 'productName', 'size', 'colour', 'unitPrice', 'quantity', 'subtotal'];
    for (const f of itemFields) {
      if (testItem[f] === undefined) {
        throw new Error(`Order item missing required field: ${f}`);
      }
    }

    if (typeof testItem.unitPrice !== 'number' || typeof testItem.subtotal !== 'number' || typeof testItem.quantity !== 'number') {
      throw new Error('Order item price and quantity must be numeric');
    }
  });

  console.log(`\n--- Test Summary: ${passed} passed, ${failed} failed ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

