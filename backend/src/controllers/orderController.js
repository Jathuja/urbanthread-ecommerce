const orderService = require('../services/orderService');
const payhereService = require('../services/payhereService');

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

    // If paymentMethod is payhere, prepare checkout parameters
    if (result.paymentMethod === 'payhere') {
      try {
        result.payhere = payhereService.preparePaymentParams({
          id: result.orderId,
          total: result.total,
          customer: result.customer,
        });
      } catch (err) {
        console.warn('Could not prepare PayHere parameters:', err.message);
        result.payhere = {
          isConfigured: false,
          message: 'PayHere parameters could not be generated. Please contact support.',
        };
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: result,
    });
  } catch (error) {
    // Centralized error handler formats the response;
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

/**
 * GET /api/orders/:id/payhere-params
 * Retrieve or regenerate PayHere checkout parameters for an existing order ID.
 * Prevents creating duplicate orders when customer retries payment.
 */
async function getPayHereParams(req, res, next) {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(Number(id));

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order #${id} not found`,
      });
    }

    const payhereData = payhereService.preparePaymentParams(order);

    res.status(200).json({
      success: true,
      data: payhereData,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/orders/payhere-notify
 * IPN callback handler from PayHere payment gateway.
 */
async function handlePayHereNotify(req, res, next) {
  try {
    const result = await payhereService.processNotification(req.body);
    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders
 * Retrieve all orders, newest first.
 */
async function getAllOrders(req, res, next) {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getOrderById,
  getAllOrders,
  getPayHereParams,
  handlePayHereNotify,
};
