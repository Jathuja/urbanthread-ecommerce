/**
 * UrbanThread Admin Seed Script
 *
 * Creates or promotes a user to the 'admin' role.
 * Uses bcrypt for password hashing (cost factor 10).
 * Safe to run multiple times — idempotent.
 *
 * Usage:
 *   node src/scripts/seedAdmin.js
 *
 * Environment Variables (override via .env or CLI):
 *   ADMIN_EMAIL    - Email for the admin account (default: admin@urbanthread.com)
 *   ADMIN_PASSWORD - Password for the admin account (default: Admin@UrbanThread2026)
 *   ADMIN_NAME     - Display name (default: UrbanThread Admin)
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const ADMIN_EMAIL    = (process.env.ADMIN_EMAIL    || 'admin@urbanthread.com').trim().toLowerCase();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'Admin@UrbanThread2026').trim();
const ADMIN_NAME     = (process.env.ADMIN_NAME     || 'UrbanThread Admin').trim();

async function seedAdmin() {
  const host     = process.env.DB_HOST     || 'localhost';
  const port     = parseInt(process.env.DB_PORT || '3306', 10);
  const user     = process.env.DB_USER     || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME     || 'urbanthread_db';

  console.log(`\n=== UrbanThread Admin Seed ===`);
  console.log(`Connecting to ${host}:${port}/${database} as ${user}...`);

  const conn = await mysql.createConnection({ host, port, user, password, database });

  // 1. Check if user with this email already exists
  const [existing] = await conn.query(
    'SELECT id, name, email, role FROM users WHERE email = ?',
    [ADMIN_EMAIL]
  );

  if (existing.length > 0) {
    const existingUser = existing[0];

    if (existingUser.role === 'admin') {
      console.log(`\n✓ Admin already exists: ${existingUser.name} <${existingUser.email}> (id: ${existingUser.id})`);
      console.log('  No changes made.\n');
      await conn.end();
      return;
    }

    // Promote existing customer to admin
    await conn.query(
      "UPDATE users SET role = 'admin' WHERE id = ?",
      [existingUser.id]
    );
    console.log(`\n✓ Promoted existing user to admin:`);
    console.log(`  Name:  ${existingUser.name}`);
    console.log(`  Email: ${existingUser.email}`);
    console.log(`  ID:    ${existingUser.id}\n`);
  } else {
    // Create new admin user
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const [result] = await conn.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (?, ?, ?, 'admin')`,
      [ADMIN_NAME, ADMIN_EMAIL, passwordHash]
    );

    console.log(`\n✓ Admin user created successfully:`);
    console.log(`  Name:  ${ADMIN_NAME}`);
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  ID:    ${result.insertId}`);
    console.log(`\n  IMPORTANT: Change the password after first login.`);
    console.log(`  Default password: ${ADMIN_PASSWORD}\n`);
  }

  await conn.end();
  console.log('=== Seed complete ===\n');
}

if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('\nAdmin seed failed:', err.message);
      process.exit(1);
    });
}

module.exports = seedAdmin;
