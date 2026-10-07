const authService = require('../services/authService');

/**
 * POST /api/auth/register
 * Register a new customer account.
 */
async function register(req, res, next) {
  try {
    const result = await authService.registerCustomer(req.body);
    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Log in customer and return JWT token.
 */
async function login(req, res, next) {
  try {
    const result = await authService.loginCustomer(req.body);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Retrieve authenticated customer profile.
 */
async function getMe(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
};
