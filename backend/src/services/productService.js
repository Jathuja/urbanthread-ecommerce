const db = require('../config/db');

/**
 * Fetch list of products with optional filters:
 * - search: keyword matched against product name or description
 * - category: category name or id
 * - size: variant size
 * - colour: variant colour
 * - minPrice: minimum product price
 * - maxPrice: maximum product price
 */
async function getProducts(filters = {}) {
  const { search, category, size, colour, minPrice, maxPrice } = filters;

  const whereClauses = [];
  const params = [];

  // Search filter (handles raw terms and normalized terms e.g. 'tshirt' matching 'T-Shirt')
  if (search && search.trim() !== '') {
    const rawSearch = search.trim();
    const cleanSearch = rawSearch.replace(/[-\s]/g, '');

    whereClauses.push(
      '(p.name LIKE ? OR p.description LIKE ? OR REPLACE(REPLACE(p.name, "-", ""), " ", "") LIKE ? OR REPLACE(REPLACE(p.description, "-", ""), " ", "") LIKE ?)'
    );
    params.push(
      `%${rawSearch}%`,
      `%${rawSearch}%`,
      `%${cleanSearch}%`,
      `%${cleanSearch}%`
    );
  }

  // Category filter (supports either category name or category id)
  if (category && category.trim() !== '') {
    if (!isNaN(category)) {
      whereClauses.push('(p.category_id = ? OR LOWER(c.name) = LOWER(?))');
      params.push(parseInt(category, 10), category.trim());
    } else {
      whereClauses.push('LOWER(c.name) = LOWER(?)');
      params.push(category.trim());
    }
  }

  // Price range filters
  if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
    whereClauses.push('p.price >= ?');
    params.push(parseFloat(minPrice));
  }

  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
    whereClauses.push('p.price <= ?');
    params.push(parseFloat(maxPrice));
  }

  // Variant size & colour filters
  if (size && colour) {
    whereClauses.push(
      'EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = ? AND LOWER(pv.colour) = LOWER(?))'
    );
    params.push(size.trim(), colour.trim());
  } else if (size) {
    whereClauses.push(
      'EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.size = ?)'
    );
    params.push(size.trim());
  } else if (colour) {
    whereClauses.push(
      'EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND LOWER(pv.colour) = LOWER(?))'
    );
    params.push(colour.trim());
  }

  // Only return active products for customer browsing unless requested
  if (!filters.includeInactive) {
    whereClauses.push('p.is_active = 1');
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const sql = `
    SELECT 
      p.id,
      p.category_id,
      c.name AS category_name,
      p.name,
      p.description,
      p.price,
      p.image_url,
      p.is_active,
      p.created_at,
      p.updated_at
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ${whereSQL}
    ORDER BY p.id ASC
  `;

  const [products] = await db.query(sql, params);

  if (products.length === 0) {
    return [];
  }

  // Fetch all variants for the returned products in one query
  const productIds = products.map((p) => p.id);
  const [variants] = await db.query(
    `SELECT id, product_id, size, colour, stock FROM product_variants WHERE product_id IN (?) ORDER BY id ASC`,
    [productIds]
  );

  // Group variants by product_id
  const variantsMap = {};
  for (const v of variants) {
    if (!variantsMap[v.product_id]) {
      variantsMap[v.product_id] = [];
    }
    variantsMap[v.product_id].push({
      id: v.id,
      size: v.size,
      colour: v.colour,
      stock: v.stock,
    });
  }

  // Format response
  return products.map((p) => {
    const productVariants = variantsMap[p.id] || [];
    const totalStock = productVariants.reduce((sum, v) => sum + v.stock, 0);

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: parseFloat(p.price),
      image_url: p.image_url,
      is_active: Boolean(p.is_active),
      category: {
        id: p.category_id,
        name: p.category_name,
      },
      stock: totalStock,
      variants: productVariants,
      created_at: p.created_at,
      updated_at: p.updated_at,
    };
  });
}

/**
 * Fetch single product by ID with category and variants
 */
async function getProductById(id, includeInactive = false) {
  const activeCondition = includeInactive ? '' : 'AND p.is_active = 1';
  const sql = `
    SELECT 
      p.id,
      p.category_id,
      c.name AS category_name,
      p.name,
      p.description,
      p.price,
      p.image_url,
      p.is_active,
      p.created_at,
      p.updated_at
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? ${activeCondition}
  `;

  const [rows] = await db.query(sql, [id]);

  if (rows.length === 0) {
    return null;
  }

  const p = rows[0];

  // Fetch variants for this product
  const [variants] = await db.query(
    'SELECT id, size, colour, stock FROM product_variants WHERE product_id = ? ORDER BY id ASC',
    [id]
  );

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: parseFloat(p.price),
    image_url: p.image_url,
    is_active: Boolean(p.is_active),
    category: {
      id: p.category_id,
      name: p.category_name,
    },
    stock: totalStock,
    variants: variants.map((v) => ({
      id: v.id,
      size: v.size,
      colour: v.colour,
      stock: v.stock,
    })),
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

module.exports = {
  getProducts,
  getProductById,
};
