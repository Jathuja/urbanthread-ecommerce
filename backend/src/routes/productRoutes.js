const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const {
  validateProductQuery,
  validateProductId,
} = require('../middleware/validateProductQuery');

router.get('/', validateProductQuery, productController.getProducts);
router.get('/:id', validateProductId, productController.getProductById);

module.exports = router;
