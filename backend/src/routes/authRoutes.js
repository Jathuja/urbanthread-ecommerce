const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validateAuthRequest');
const { authenticate } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', validateRegister, authController.register);

// POST /api/auth/login
router.post('/login', validateLogin, authController.login);

// GET /api/auth/me (Protected)
router.get('/me', authenticate, authController.getMe);

// PUT /api/auth/profile (Protected) — update name, phone, address, city
router.put('/profile', authenticate, authController.updateProfile);

// PUT /api/auth/password (Protected) — change password
router.put('/password', authenticate, authController.changePassword);
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;

