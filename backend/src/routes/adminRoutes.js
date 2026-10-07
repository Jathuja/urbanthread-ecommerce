const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

// All admin routes require authentication AND admin role
// GET /api/admin/dashboard
router.get('/dashboard', authenticate, requireAdmin, adminController.getDashboard);

module.exports = router;
