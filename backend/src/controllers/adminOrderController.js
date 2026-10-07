const adminOrderService = require('../services/adminOrderService');

/**
 * GET /api/admin/orders
 * Fetch all orders with optional search and status filters.
 */
async function getOrders(req, res, next) {
  try {
    const { search, order_status, payment_status, payment_method } = req.query;
    const orders = await adminOrderService.getAdminOrders({
      search,
      order_status,
      payment_status,
      payment_method,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/orders/:id
 * Retrieve full order details including customer, delivery, items, and payment info.
 */
async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await adminOrderService.getAdminOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/orders/:id/status
 * Update the order fulfillment status with state machine transition rules.
 * Preserves payment status and security integrity.
 */
async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await adminOrderService.updateOrderStatus(id, status);

    res.status(200).json({
      success: true,
      message: `Order #${id} status updated to "${updatedOrder.orderStatus}"`,
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus,
};
