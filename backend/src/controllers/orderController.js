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
    const userId = req.user ? req.user.id : null;

    const result = await orderService.createOrder({
      customer,
      items,
      paymentMethod,
      userId,
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
 * Enforces customer ownership: Customer A cannot view Customer B's order.
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

    // Ownership verification
    if (req.user) {
      // Authenticated customer: can only view their own orders
      const isOwnerById = order.userId !== null && order.userId === req.user.id;
      const isOwnerByEmail =
        order.userId === null &&
        order.customer?.email &&
        order.customer.email.toLowerCase() === req.user.email.toLowerCase();

      if (!isOwnerById && !isOwnerByEmail) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this order',
        });
      }
    } else {
      // Unauthenticated request:
      // If the order belongs to a registered customer account, require authentication
      if (order.userId !== null) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to view this order',
        });
      }
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

    // Ownership verification
    if (req.user) {
      const isOwnerById = order.userId !== null && order.userId === req.user.id;
      const isOwnerByEmail =
        order.userId === null &&
        order.customer?.email &&
        order.customer.email.toLowerCase() === req.user.email.toLowerCase();

      if (!isOwnerById && !isOwnerByEmail) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access payment parameters for this order',
        });
      }
    } else if (order.userId !== null) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access this order',
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
 * Retrieve orders, newest first.
 * If authenticated, only returns the customer's own orders.
 */
async function getAllOrders(req, res, next) {
  try {
    const orders = req.user
      ? await orderService.getAllOrders(req.user.id, req.user.email)
      : await orderService.getAllOrders();

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
