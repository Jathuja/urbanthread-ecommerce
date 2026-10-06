/**
 * Middleware to validate the POST /api/orders request body.
 *
 * Validates:
 *  - customer fields: name, email, phone, address, city
 *  - items array: non-empty, each item has productId, variantId, quantity >= 1
 *  - paymentMethod: must be one of the supported values
 */
const { SUPPORTED_PAYMENT_METHODS } = require('../services/orderService');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-().]{7,20}$/;

function validateOrderRequest(req, res, next) {
  const { customer, items, paymentMethod } = req.body;
  const errors = [];

  // ---- Customer validation ----
  if (!customer || typeof customer !== 'object') {
    errors.push('customer object is required');
  } else {
    if (!customer.name || typeof customer.name !== 'string' || customer.name.trim().length < 2) {
      errors.push('customer.name is required and must be at least 2 characters');
    }
    if (!customer.email || typeof customer.email !== 'string' || !EMAIL_REGEX.test(customer.email.trim())) {
      errors.push('customer.email is required and must be a valid email address');
    }
    if (!customer.phone || typeof customer.phone !== 'string' || !PHONE_REGEX.test(customer.phone.trim())) {
      errors.push('customer.phone is required and must be a valid phone number (7-20 digits)');
    }
    if (!customer.address || typeof customer.address !== 'string' || customer.address.trim().length < 5) {
      errors.push('customer.address is required and must be at least 5 characters');
    }
    if (!customer.city || typeof customer.city !== 'string' || customer.city.trim().length < 2) {
      errors.push('customer.city is required and must be at least 2 characters');
    }
  }

  // ---- Items validation ----
  if (!Array.isArray(items) || items.length === 0) {
    errors.push('items must be a non-empty array');
  } else {
    items.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`items[${index}] must be an object`);
        return;
      }

      const productId = parseInt(item.productId, 10);
      if (!item.productId || isNaN(productId) || productId <= 0) {
        errors.push(`items[${index}].productId must be a positive integer`);
      }

      const variantId = parseInt(item.variantId, 10);
      if (!item.variantId || isNaN(variantId) || variantId <= 0) {
        errors.push(`items[${index}].variantId must be a positive integer`);
      }

      const quantity = parseInt(item.quantity, 10);
      if (item.quantity === undefined || isNaN(quantity) || quantity < 1) {
        errors.push(`items[${index}].quantity must be a positive integer (>= 1)`);
      }
    });
  }

  // ---- Payment method validation ----
  if (!paymentMethod || !SUPPORTED_PAYMENT_METHODS.includes(paymentMethod)) {
    errors.push(
      `paymentMethod is required and must be one of: ${SUPPORTED_PAYMENT_METHODS.join(', ')}`
    );
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
}

/**
 * Middleware to validate the order ID path parameter.
 */
function validateOrderId(req, res, next) {
  const { id } = req.params;
  const numId = Number(id);

  if (!Number.isInteger(numId) || numId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid order ID: ID must be a positive integer',
    });
  }

  next();
}

module.exports = {
  validateOrderRequest,
  validateOrderId,
};
