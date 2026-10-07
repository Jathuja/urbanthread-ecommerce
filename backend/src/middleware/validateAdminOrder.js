const { VALID_ORDER_STATUSES } = require('../services/adminOrderService');

/**
 * Validate order ID route parameter
 */
function validateAdminOrderId(req, res, next) {
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

/**
 * Validate order status update payload
 */
function validateUpdateOrderStatus(req, res, next) {
  const status = req.body.status !== undefined ? req.body.status : req.body.order_status;

  if (!status || typeof status !== 'string' || status.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: `Order status is required. Allowed values: ${VALID_ORDER_STATUSES.join(', ')}`,
    });
  }

  const normalized = status.trim().toLowerCase();
  if (!VALID_ORDER_STATUSES.includes(normalized)) {
    return res.status(400).json({
      success: false,
      message: `Invalid order status "${status}". Allowed values: ${VALID_ORDER_STATUSES.join(', ')}`,
    });
  }

  req.body.status = normalized;
  next();
}

module.exports = {
  validateAdminOrderId,
  validateUpdateOrderStatus,
};
