const adminService = require('../services/adminService');

/**
 * GET /api/admin/dashboard
 * Returns summary statistics for the admin dashboard.
 * Protected: authenticate + requireAdmin
 */
async function getDashboard(req, res, next) {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({
      success: true,
      data: {
        admin: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getDashboard };
