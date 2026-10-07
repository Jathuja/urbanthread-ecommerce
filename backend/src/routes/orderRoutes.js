const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const {
  validateOrderRequest,
  validateOrderId,
} = require('../middleware/validateOrderRequest');
const { optionalAuth } = require('../middleware/authMiddleware');

// POST /api/orders — create a new order (optionalAuth binds to customer if logged in)
router.post('/', optionalAuth, validateOrderRequest, orderController.createOrder);

// POST /api/orders/payhere-notify — PayHere IPN callback
router.post('/payhere-notify', orderController.handlePayHereNotify);

// GET /api/orders — retrieve orders (if authenticated, customer only sees their own)
router.get('/', optionalAuth, orderController.getAllOrders);

// GET /api/orders/:id/payhere-params — retrieve PayHere checkout params for existing order
router.get('/:id/payhere-params', optionalAuth, validateOrderId, orderController.getPayHereParams);

// GET /api/orders/:id — retrieve an order by ID (with ownership check)
router.get('/:id', optionalAuth, validateOrderId, orderController.getOrderById);

module.exports = router;
