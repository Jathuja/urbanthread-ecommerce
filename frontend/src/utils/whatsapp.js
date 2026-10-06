/**
 * WhatsApp Order Utility
 *
 * Provides functions to format order details into a clean WhatsApp text message
 * and construct standard WhatsApp click-to-chat links using the configured business number.
 */

/**
 * Format currency for WhatsApp message
 * @param {number|string} amount
 * @returns {string} Formatted LKR string
 */
function formatCurrency(amount) {
  const num = Number(amount || 0);
  return `LKR ${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Retrieve and sanitize the WhatsApp business phone number from environment.
 * Expects international numeric format without '+' or spaces (e.g. 94770000000).
 *
 * @returns {string|null} Sanitized numeric phone string, or null if not set
 */
export function getWhatsAppBusinessNumber() {
  const rawNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  if (!rawNumber || typeof rawNumber !== 'string') {
    return null;
  }

  // Remove non-numeric characters (+, -, spaces, parentheses)
  const cleaned = rawNumber.replace(/[^\d]/g, '');
  return cleaned.length >= 7 ? cleaned : null;
}

/**
 * Format order data returned from the backend into a structured WhatsApp message.
 *
 * Contains all mandatory fields:
 *  - Order ID
 *  - Customer name, phone, shipping address, city
 *  - Product name, size, colour, quantity, unit price, item subtotal
 *  - Order subtotal, delivery fee, total
 *  - Payment method, order status
 *
 * @param {Object} order - Full order object returned from the backend API
 * @returns {string} Clean formatted plain text string
 */
export function formatWhatsAppOrderMessage(order) {
  if (!order) return '';

  const orderId = order.orderId || order.id || 'N/A';
  const customer = order.customer || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = order.subtotal ?? 0;
  const deliveryFee = order.deliveryFee ?? 0;
  const total = order.total ?? 0;

  // Pretty payment method label
  const method = String(order.paymentMethod || '').toLowerCase().trim();
  let paymentMethodLabel = 'WhatsApp Order';
  if (method === 'payhere') {
    paymentMethodLabel = 'PayHere Online Payment';
  } else if (method === 'cash_on_delivery') {
    paymentMethodLabel = 'Cash on Delivery';
  } else if (method === 'whatsapp') {
    paymentMethodLabel = 'WhatsApp Order';
  } else if (order.paymentMethod) {
    paymentMethodLabel = order.paymentMethod;
  }

  // Pretty order status label (e.g. 'Pending')
  const orderStatus = order.orderStatus
    ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)
    : 'Pending';

  const customerName = customer.name || 'N/A';
  const customerPhone = customer.phone || 'N/A';
  const customerAddress = customer.address || 'N/A';
  const customerCity = customer.city || 'N/A';

  // Format item lines
  const itemsList = items
    .map((item, index) => {
      const productName = item.productName || item.name || 'Product';
      const size = item.size || 'N/A';
      const colour = item.colour || 'N/A';
      const quantity = item.quantity || 1;
      const unitPrice = item.unitPrice ?? item.price ?? 0;
      const itemSubtotal = item.subtotal ?? unitPrice * quantity;

      return (
        `${index + 1}. *${productName}*\n` +
        `   • Size: ${size}\n` +
        `   • Colour: ${colour}\n` +
        `   • Quantity: ${quantity}\n` +
        `   • Unit Price: ${formatCurrency(unitPrice)}\n` +
        `   • Item Subtotal: ${formatCurrency(itemSubtotal)}`
      );
    })
    .join('\n\n');

  let message = `*NEW ORDER - URBANTHREAD* 🛍️\n\n`;
  message += `*Order Reference:* #${orderId}\n`;
  message += `*Order Status:* ${orderStatus}\n`;
  message += `*Payment Method:* ${paymentMethodLabel}\n\n`;

  message += `*Customer Details:*\n`;
  message += `• Customer Name: ${customerName}\n`;
  message += `• Customer Phone: ${customerPhone}\n`;
  message += `• Shipping Address: ${customerAddress}\n`;
  message += `• City: ${customerCity}\n`;
  if (customer.notes && customer.notes.trim()) {
    message += `• Order Notes: ${customer.notes.trim()}\n`;
  }
  message += `\n`;

  message += `*Items Ordered:*\n`;
  message += `${itemsList || 'No items listed'}\n\n`;

  message += `*Financial Breakdown:*\n`;
  message += `• Order Subtotal: ${formatCurrency(subtotal)}\n`;
  message += `• Delivery Fee: ${formatCurrency(deliveryFee)}\n`;
  message += `• Total: ${formatCurrency(total)}\n\n`;

  message += `Hello UrbanThread Team, I have placed this order online. Please verify my details and confirm order dispatch. Thank you!`;

  return message;
}

/**
 * Generate standard WhatsApp click-to-chat URL with properly encoded message.
 *
 * @param {Object} order - Full backend order response
 * @returns {{ url: string|null, message: string, error: string|null }}
 */
export function generateWhatsAppOrderUrl(order) {
  const message = formatWhatsAppOrderMessage(order);
  const businessNumber = getWhatsAppBusinessNumber();

  if (!businessNumber) {
    return {
      url: null,
      message,
      error: 'WhatsApp Business phone number is not configured in environment variables (VITE_WHATSAPP_NUMBER).',
    };
  }

  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${businessNumber}?text=${encodedMessage}`;

  return {
    url,
    message,
    error: null,
  };
}
