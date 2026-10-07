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

/**
 * PUT /api/auth/profile
 * Update authenticated customer's profile info.
 */
async function updateProfile(req, res, next) {
  try {
    const updatedUser = await authService.updateProfile(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/auth/password
 * Change authenticated customer's password.
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'currentPassword and newPassword are required',
      });
    }
    if (confirmPassword !== undefined && confirmPassword !== newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match',
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};

