const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const {
  validateOrderRequest,
  validateOrderId,
} = require('../middleware/validateOrderRequest');

// POST /api/orders — create a new order
router.post('/', validateOrderRequest, orderController.createOrder);

// GET /api/orders/:id — retrieve an order by ID
router.get('/:id', validateOrderId, orderController.getOrderById);

module.exports = router;
