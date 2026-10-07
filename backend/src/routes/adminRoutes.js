const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminProductController = require('../controllers/adminProductController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateVariantPayload,
} = require('../middleware/validateAdminProduct');

// Apply authentication and admin role requirement to all /api/admin routes
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Products CRUD
router.get('/products', adminProductController.getProducts);
router.get('/products/:id', adminProductController.getProductById);
router.post('/products', validateCreateProduct, adminProductController.createProduct);
router.put('/products/:id', validateUpdateProduct, adminProductController.updateProduct);
router.delete('/products/:id', adminProductController.deleteProduct);

// Variants CRUD
router.post('/products/:id/variants', validateVariantPayload, adminProductController.addVariant);
router.put('/products/:id/variants/:variantId', validateVariantPayload, adminProductController.updateVariant);
router.delete('/products/:id/variants/:variantId', adminProductController.deleteVariant);

module.exports = router;
