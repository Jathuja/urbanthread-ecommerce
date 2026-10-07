/**
 * Simple email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate customer registration payload.
 *
 * Expected body:
 *  - name: string (min 2 chars)
 *  - email: valid email string
 *  - password: string (min 6 chars)
 *  - phone: optional string
 */
function validateRegister(req, res, next) {
  const { name, email, password, phone } = req.body;
  const errors = [];

  // Name validation
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters');
  }

  // Email validation
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  // Password validation
  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password is required and must be at least 6 characters');
  }

  // Phone validation (optional)
  if (phone !== undefined && phone !== null && typeof phone === 'string' && phone.trim().length > 0) {
    if (phone.trim().length < 7 || phone.trim().length > 20) {
      errors.push('Phone number must be between 7 and 20 characters');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors,
    });
  }

  next();
}

/**
 * Validate customer login payload.
 *
 * Expected body:
 *  - email: valid email string
 *  - password: string
 */
function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0],
      errors,
    });
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
};
