const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key_12345';

/**
 * Middleware: Require valid JWT authentication token.
 * Populates req.user with decoded user payload and database user record.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required',
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Expected "Bearer <token>"',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Verify user exists in database and fetch current role
    const [rows] = await db.query(
      'SELECT id, name, email, phone, address, city, role, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account not found',
      });
    }

    const user = rows[0];
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      role: user.role,
      createdAt: user.created_at,
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware: Optional JWT authentication.
 * If token is present and valid, attaches req.user.
 * If token is missing, leaves req.user = null and proceeds.
 * If token is present but invalid, returns 401.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      req.user = null;
      return next();
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Expected "Bearer <token>"',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      req.user = null;
      return next();
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    const [rows] = await db.query(
      'SELECT id, name, email, phone, address, city, role, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length > 0) {
      const user = rows[0];
      req.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        role: user.role,
        createdAt: user.created_at,
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware: Require ADMIN role.
 * Must be used AFTER authenticate middleware.
 * Returns 403 Forbidden if the authenticated user is not an admin.
 * Role is verified from the database record (not from JWT payload alone).
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token required',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }

  next();
}

module.exports = {
  authenticate,
  optionalAuth,
  requireAdmin,
};
