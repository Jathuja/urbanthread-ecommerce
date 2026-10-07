const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const {
  validateOrderRequest,
  validateOrderId,
} = require('../middleware/validateOrderRequest');

// POST /api/orders — create a new order
router.post('/', validateOrderRequest, orderController.createOrder);

// POST /api/orders/payhere-notify — PayHere IPN callback
router.post('/payhere-notify', orderController.handlePayHereNotify);

// GET /api/orders — retrieve all orders
router.get('/', orderController.getAllOrders);

// GET /api/orders/:id/payhere-params — retrieve PayHere checkout params for existing order
router.get('/:id/payhere-params', validateOrderId, orderController.getPayHereParams);

// GET /api/orders/:id — retrieve an order by ID
router.get('/:id', validateOrderId, orderController.getOrderById);

module.exports = router;
