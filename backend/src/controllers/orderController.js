const orderService = require('../services/orderService');

/**
 * POST /api/orders
 * Create a new order.
 *
 * Expects validated body (via validateOrderRequest middleware):
 *  - customer: { name, email, phone, address, city, notes? }
 *  - items: [{ productId, variantId, quantity }]
 *  - paymentMethod: 'whatsapp' | 'payhere' | 'cash_on_delivery'
 */
async function createOrder(req, res, next) {
  try {
    const { customer, items, paymentMethod } = req.body;

    const result = await orderService.createOrder({
      customer,
      items,
      paymentMethod,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: result,
    });
  } catch (error) {
    // Let the centralized error handler format the response;
    // statusCode is set by the service for known error types (404, 409).
    next(error);
  }
}

/**
 * GET /api/orders/:id
 * Retrieve an order and its items by ID.
 */
async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(Number(id));

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
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

module.exports = {
  createOrder,
  getOrderById,
};
