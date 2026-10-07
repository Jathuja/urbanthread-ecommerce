const db = require('../config/db');

/**
 * Get admin dashboard summary statistics.
 * Queries counts and aggregates from the database.
 */
async function getDashboardStats() {
  const [[{ totalProducts }]] = await db.query(
    'SELECT COUNT(*) AS totalProducts FROM products'
  );

  const [[{ totalOrders }]] = await db.query(
    'SELECT COUNT(*) AS totalOrders FROM orders'
  );

  const [[{ totalCustomers }]] = await db.query(
    "SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 'customer'"
  );

  const [[{ pendingOrders }]] = await db.query(
    "SELECT COUNT(*) AS pendingOrders FROM orders WHERE order_status = 'pending'"
  );

  const [[{ totalRevenue }]] = await db.query(
    "SELECT COALESCE(SUM(total), 0) AS totalRevenue FROM orders WHERE payment_status = 'paid'"
  );

  const [[{ todayOrders }]] = await db.query(
    'SELECT COUNT(*) AS todayOrders FROM orders WHERE DATE(created_at) = CURDATE()'
  );

  // Recent 5 orders
  const [recentOrders] = await db.query(`
    SELECT
      o.id,
      o.customer_name,
      o.customer_email,
      o.total,
      o.order_status,
      o.payment_status,
      o.payment_method,
      o.created_at
    FROM orders o
    ORDER BY o.created_at DESC
    LIMIT 5
  `);

  return {
    totalProducts: Number(totalProducts),
    totalOrders: Number(totalOrders),
    totalCustomers: Number(totalCustomers),
    pendingOrders: Number(pendingOrders),
    totalRevenue: Number(totalRevenue),
    todayOrders: Number(todayOrders),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      total: Number(o.total),
      orderStatus: o.order_status,
      paymentStatus: o.payment_status,
      paymentMethod: o.payment_method,
      createdAt: o.created_at,
    })),
  };
}

module.exports = { getDashboardStats };
