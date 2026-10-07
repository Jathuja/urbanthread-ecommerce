const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key_12345';
const JWT_EXPIRES_IN = '7d';

/**
 * Register a new customer.
 * Hashes password using bcrypt and generates a JWT.
 * Prevents duplicate email registrations (409 Conflict).
 *
 * @param {Object} data - { name, email, password, phone, address, city }
 * @returns {Object} { user, token }
 */
async function registerCustomer(data) {
  const { name, email, password, phone, address, city } = data;
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();
  const trimmedPhone = phone ? phone.trim() : null;
  const trimmedAddress = address ? address.trim() : null;
  const trimmedCity = city ? city.trim() : null;

  // 1. Check for duplicate email
  const [existingRows] = await db.query(
    'SELECT id FROM users WHERE email = ?',
    [normalizedEmail]
  );

  if (existingRows.length > 0) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  // 2. Hash password securely
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Insert customer into database
  const [result] = await db.query(
    `INSERT INTO users (name, email, password_hash, phone, address, city, role)
     VALUES (?, ?, ?, ?, ?, ?, 'customer')`,
    [trimmedName, normalizedEmail, passwordHash, trimmedPhone, trimmedAddress, trimmedCity]
  );

  const userId = result.insertId;

  // 4. Generate JWT
  const token = jwt.sign(
    {
      id: userId,
      email: normalizedEmail,
      name: trimmedName,
      role: 'customer',
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // 5. Return sanitized user object (never expose password_hash)
  return {
    user: {
      id: userId,
      name: trimmedName,
      email: normalizedEmail,
      phone: trimmedPhone,
      address: trimmedAddress,
      city: trimmedCity,
      role: 'customer',
      createdAt: new Date().toISOString(),
    },
    token,
  };
}

/**
 * Customer login with email and password.
 * Validates credentials and returns JWT upon success.
 *
 * @param {Object} credentials - { email, password }
 * @returns {Object} { user, token }
 */
async function loginCustomer({ email, password }) {
  const normalizedEmail = (email || '').trim().toLowerCase();

  // 1. Find user by email
  const [rows] = await db.query(
    `SELECT id, name, email, password_hash, phone, address, city, role, created_at
     FROM users
     WHERE email = ?`,
    [normalizedEmail]
  );

  if (rows.length === 0) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const user = rows[0];

  // 2. Verify password with bcrypt
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // 3. Generate JWT
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // 4. Return sanitized user object
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      role: user.role,
      createdAt: user.created_at,
    },
    token,
  };
}

/**
 * Retrieve user by ID.
 *
 * @param {number} id
 * @returns {Object|null}
 */
async function getUserById(id) {
  const [rows] = await db.query(
    `SELECT id, name, email, phone, address, city, role, created_at, updated_at
     FROM users
     WHERE id = ?`,
    [id]
  );

  if (rows.length === 0) {
    return null;
  }

  const u = rows[0];
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    address: u.address,
    city: u.city,
    role: u.role,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

module.exports = {
  registerCustomer,
  loginCustomer,
  getUserById,
};
