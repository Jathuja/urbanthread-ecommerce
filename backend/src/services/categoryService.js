const db = require('../config/db');

async function getAllCategories() {
  const [rows] = await db.query(
    'SELECT id, name, created_at FROM categories ORDER BY name ASC'
  );
  return rows;
}

module.exports = {
  getAllCategories,
};
