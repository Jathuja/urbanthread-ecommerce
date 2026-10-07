const crypto = require('crypto');
const db = require('../config/db');

/**
 * Utility to calculate MD5 hex string in uppercase.
 */
function md5(str) {
  return crypto.createHash('md5').update(String(str)).digest('hex').toUpperCase();
}

/**
 * Retrieve PayHere configuration from environment variables.
 */
function getPayHereConfig() {
  const merchantId = (process.env.PAYHERE_MERCHANT_ID || '').trim();
  const merchantSecret = (process.env.PAYHERE_MERCHANT_SECRET || '').trim();
  const sandboxUrl = (
    process.env.PAYHERE_SANDBOX_URL || 'https://sandbox.payhere.lk/pay/checkout'
  ).trim();
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').trim().replace(/\/$/, '');
  const backendUrl = (process.env.BACKEND_URL || 'http://localhost:5001').trim().replace(/\/$/, '');

  return {
    merchantId,
    merchantSecret,
    sandboxUrl,
    frontendUrl,
    backendUrl,
  };
}

/**
 * Check whether required PayHere merchant credentials are configured.
 */
function isPayHereConfigured() {
  const { merchantId, merchantSecret } = getPayHereConfig();
  return Boolean(merchantId && merchantSecret);
}

/**
 * Generate PayHere payment hash for payment checkout initiation.
 *
 * Formula according to official PayHere documentation:
 * hash = strtoupper(md5(merchant_id + order_id + number_format(amount, 2, '.', '') + currency + strtoupper(md5(merchant_secret))))
 *
 * @param {Object} params
 * @param {string|number} params.merchantId
 * @param {string|number} params.orderId
 * @param {number|string} params.amount
 * @param {string}        params.currency
 * @param {string}        params.merchantSecret
 * @returns {string} Uppercase MD5 hash
 */
function generatePaymentHash({ merchantId, orderId, amount, currency = 'LKR', merchantSecret }) {
  if (!merchantId || !orderId || amount === undefined || !merchantSecret) {
    throw new Error('Missing parameters for PayHere hash generation');
  }

  const hashedSecret = md5(merchantSecret);
  const amountFormatted = parseFloat(amount).toFixed(2);
  const rawString = `${merchantId}${orderId}${amountFormatted}${currency}${hashedSecret}`;
  return md5(rawString);
}

/**
 * Verify PayHere Instant Payment Notification (IPN) signature.
 *
 * Formula according to official PayHere documentation:
 * local_md5sig = strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))
 *
 * @param {Object} params
 * @param {string} params.merchantId
 * @param {string} params.orderId
 * @param {string} params.payhereAmount
 * @param {string} params.payhereCurrency
 * @param {string|number} params.statusCode
 * @param {string} params.md5sig
 * @param {string} params.merchantSecret
 * @returns {boolean} True if signature is valid
 */
function verifyNotificationSignature({
  merchantId,
  orderId,
  payhereAmount,
  payhereCurrency,
  statusCode,
  md5sig,
  merchantSecret,
}) {
  if (
    !merchantId ||
    !orderId ||
    !payhereAmount ||
    !payhereCurrency ||
    statusCode === undefined ||
    !md5sig ||
    !merchantSecret
  ) {
    return false;
  }

  const hashedSecret = md5(merchantSecret);
  const rawString = `${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${hashedSecret}`;
  const localSignature = md5(rawString);

  return localSignature === String(md5sig).toUpperCase().trim();
}

/**
 * Prepare PayHere payment parameters for an existing database order.
 *
 * Sourced strictly from the authoritative database order record.
 * Never exposes PAYHERE_MERCHANT_SECRET to the client.
 *
 * @param {Object} order - Full order object
 * @returns {Object} PayHere checkout payload or unconfigured state
 */
function preparePaymentParams(order) {
  if (!order || !order.id) {
    throw new Error('A valid order object with an ID is required to prepare PayHere payment');
  }

  const config = getPayHereConfig();

  if (!isPayHereConfigured()) {
    return {
      isConfigured: false,
      message:
        'PayHere merchant credentials are not configured on the server. Please configure PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET.',
    };
  }

  const orderId = String(order.id);
  const amountFormatted = parseFloat(order.total).toFixed(2);
  const currency = 'LKR';

  const hash = generatePaymentHash({
    merchantId: config.merchantId,
    orderId,
    amount: amountFormatted,
    currency,
    merchantSecret: config.merchantSecret,
  });

  // Extract first and last name from customer.name
  const fullName = (order.customer?.name || '').trim();
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || firstName;

  return {
    isConfigured: true,
    checkoutUrl: config.sandboxUrl,
    params: {
      merchant_id: config.merchantId,
      return_url: `${config.frontendUrl}/checkout?payhere_status=success&order_id=${orderId}`,
      cancel_url: `${config.frontendUrl}/checkout?payhere_status=cancelled&order_id=${orderId}`,
      notify_url: `${config.backendUrl}/api/orders/payhere-notify`,
      order_id: orderId,
      items: `UrbanThread Order #${orderId}`,
      currency,
      amount: amountFormatted,
      first_name: firstName,
      last_name: lastName,
      email: order.customer?.email || '',
      phone: order.customer?.phone || '',
      address: order.customer?.address || '',
      city: order.customer?.city || '',
      country: 'Sri Lanka',
      hash,
    },
  };
}

/**
 * Process incoming PayHere IPN notification callback.
 *
 * Validates:
 *   1. PayHere credentials are configured
 *   2. Merchant ID matches
 *   3. Signature md5sig matches
 *   4. Order exists in database
 *   5. Currency is LKR and amount matches authoritative order total
 *
 * Transitions:
 *   - status_code 2  -> payment_status: 'paid',   order_status: 'processing'
 *   - status_code 0  -> payment_status: 'pending',order_status: 'pending'
 *   - status_code <0 -> payment_status: 'failed', order_status: 'cancelled'
 *
 * @param {Object} payload - PayHere POST parameters (from req.body)
 * @returns {Promise<{ success: boolean, message: string, orderId: number, status: string }>}
 */
async function processNotification(payload) {
  const config = getPayHereConfig();

  if (!isPayHereConfigured()) {
    const error = new Error('PayHere is not configured on the server');
    error.statusCode = 503;
    throw error;
  }

  const {
    merchant_id,
    order_id,
    payment_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
  } = payload;

  if (!order_id || !status_code || !md5sig) {
    const error = new Error('Missing required notification parameters (order_id, status_code, md5sig)');
    error.statusCode = 400;
    throw error;
  }

  // 1. Verify merchant ID
  if (merchant_id && merchant_id !== config.merchantId) {
    const error = new Error('Merchant ID does not match configured merchant');
    error.statusCode = 400;
    throw error;
  }

  // 2. Verify signature
  const isValidSignature = verifyNotificationSignature({
    merchantId: merchant_id || config.merchantId,
    orderId: order_id,
    payhereAmount: payhere_amount,
    payhereCurrency: payhere_currency,
    statusCode: status_code,
    md5sig,
    merchantSecret: config.merchantSecret,
  });

  if (!isValidSignature) {
    const error = new Error('Invalid PayHere notification signature (md5sig mismatch)');
    error.statusCode = 400;
    throw error;
  }

  // 3. Find order in database
  const orderIdNum = parseInt(order_id, 10);
  if (isNaN(orderIdNum)) {
    const error = new Error('Invalid order_id format in notification');
    error.statusCode = 400;
    throw error;
  }

  const [orderRows] = await db.query(
    'SELECT id, total, payment_status, order_status FROM orders WHERE id = ?',
    [orderIdNum]
  );

  if (orderRows.length === 0) {
    const error = new Error(`Order #${orderIdNum} not found`);
    error.statusCode = 404;
    throw error;
  }

  const order = orderRows[0];

  // 4. Validate currency and amount
  if (payhere_currency && payhere_currency !== 'LKR') {
    const error = new Error(`Currency mismatch: expected LKR, received ${payhere_currency}`);
    error.statusCode = 400;
    throw error;
  }

  if (payhere_amount !== undefined) {
    const expectedTotal = parseFloat(order.total).toFixed(2);
    const receivedAmount = parseFloat(payhere_amount).toFixed(2);
    if (expectedTotal !== receivedAmount) {
      const error = new Error(
        `Payment amount mismatch: expected ${expectedTotal}, received ${receivedAmount}`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // 5. Handle duplicate notification idempotency
  if (order.payment_status === 'paid' && String(status_code) === '2') {
    return {
      success: true,
      message: 'Order is already marked as paid (duplicate notification ignored)',
      orderId: orderIdNum,
      paymentStatus: 'paid',
      orderStatus: order.order_status,
      paymentId: payment_id,
    };
  }

  // 6. Update payment & order status based on status_code
  // Status code: 2 = Success, 0 = Pending, -1 = Canceled, -2 = Failed, -3 = Chargedback
  const numericStatus = parseInt(status_code, 10);
  let newPaymentStatus = order.payment_status;
  let newOrderStatus = order.order_status;

  if (numericStatus === 2) {
    newPaymentStatus = 'paid';
    newOrderStatus = 'processing';
  } else if (numericStatus === 0) {
    newPaymentStatus = 'pending';
    newOrderStatus = 'pending';
  } else if (numericStatus < 0) {
    newPaymentStatus = 'failed';
    newOrderStatus = 'cancelled';
  }

  await db.query(
    'UPDATE orders SET payment_status = ?, order_status = ? WHERE id = ?',
    [newPaymentStatus, newOrderStatus, orderIdNum]
  );

  return {
    success: true,
    message: `Payment status updated to '${newPaymentStatus}'`,
    orderId: orderIdNum,
    paymentStatus: newPaymentStatus,
    orderStatus: newOrderStatus,
    paymentId: payment_id,
  };
}

module.exports = {
  getPayHereConfig,
  isPayHereConfigured,
  generatePaymentHash,
  verifyNotificationSignature,
  preparePaymentParams,
  processNotification,
};
