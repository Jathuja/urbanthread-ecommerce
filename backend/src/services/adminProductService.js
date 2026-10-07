const db = require('../config/db');

/**
 * Fetch all products for the admin panel with optional filters:
 * - search: keyword matched against product name or description
 * - category: category ID or category name
 * - status: 'active', 'inactive', or 'all' (default: 'all')
 */
async function getAdminProducts(filters = {}) {
  const { search, category, status } = filters;
  const whereClauses = [];
  const params = [];

  // Search filter
  if (search && search.trim() !== '') {
    const rawSearch = search.trim();
    const cleanSearch = rawSearch.replace(/[-\s]/g, '');
    whereClauses.push(
      '(p.name LIKE ? OR p.description LIKE ? OR REPLACE(REPLACE(p.name, "-", ""), " ", "") LIKE ? OR REPLACE(REPLACE(p.description, "-", ""), " ", "") LIKE ?)'
    );
    params.push(`%${rawSearch}%`, `%${rawSearch}%`, `%${cleanSearch}%`, `%${cleanSearch}%`);
  }

  // Category filter
  if (category && category.trim() !== '') {
    if (!isNaN(category)) {
      whereClauses.push('(p.category_id = ? OR LOWER(c.name) = LOWER(?))');
      params.push(parseInt(category, 10), category.trim());
    } else {
      whereClauses.push('LOWER(c.name) = LOWER(?)');
      params.push(category.trim());
    }
  }

  // Status filter
  if (status === 'active') {
    whereClauses.push('p.is_active = 1');
  } else if (status === 'inactive') {
    whereClauses.push('p.is_active = 0');
  }
  // If 'all' or undefined, no is_active clause is added

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
    ORDER BY p.id DESC
  `;

  const [products] = await db.query(sql, params);

  if (products.length === 0) {
    return [];
  }

  // Fetch all variants for these products
  const productIds = products.map((p) => p.id);
  const [variants] = await db.query(
    'SELECT id, product_id, size, colour, stock FROM product_variants WHERE product_id IN (?) ORDER BY id ASC',
    [productIds]
  );

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
      variant_count: productVariants.length,
      total_stock: totalStock,
      variants: productVariants,
      created_at: p.created_at,
      updated_at: p.updated_at,
    };
  });
}

/**
 * Fetch a single product by ID for admin (including inactive)
 */
async function getAdminProductById(id) {
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
    WHERE p.id = ?
  `;

  const [rows] = await db.query(sql, [id]);
  if (rows.length === 0) {
    return null;
  }

  const p = rows[0];

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
    variant_count: variants.length,
    total_stock: totalStock,
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

/**
 * Create a new product and optional variants inside a transaction
 */
async function createProduct({ name, description, category_id, price, image_url, is_active = true, variants = [] }) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Verify category exists
    const [catRows] = await conn.query('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (catRows.length === 0) {
      const err = new Error(`Category with ID ${category_id} not found`);
      err.statusCode = 400;
      throw err;
    }

    // 2. Validate variants array for duplicates and negative stocks
    if (Array.isArray(variants) && variants.length > 0) {
      const seen = new Set();
      for (const v of variants) {
        const sizeTrim = (v.size || '').trim();
        const colourTrim = (v.colour || '').trim();
        const stockInt = parseInt(v.stock, 10);

        if (!sizeTrim || !colourTrim) {
          const err = new Error('Each variant must have both a size and a colour');
          err.statusCode = 400;
          throw err;
        }

        if (isNaN(stockInt) || stockInt < 0) {
          const err = new Error('Variant stock must be an integer greater than or equal to 0');
          err.statusCode = 400;
          throw err;
        }

        const key = `${sizeTrim.toLowerCase()}|${colourTrim.toLowerCase()}`;
        if (seen.has(key)) {
          const err = new Error(`Duplicate variant: size "${sizeTrim}" and colour "${colourTrim}" already specified`);
          err.statusCode = 400;
          throw err;
        }
        seen.add(key);
      }
    }

    // 3. Insert product
    const [prodResult] = await conn.query(
      `INSERT INTO products (category_id, name, description, price, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name.trim(),
        description ? description.trim() : null,
        parseFloat(price),
        image_url ? image_url.trim() : null,
        is_active ? 1 : 0,
      ]
    );

    const productId = prodResult.insertId;

    // 4. Insert variants
    if (Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        await conn.query(
          `INSERT INTO product_variants (product_id, size, colour, stock)
           VALUES (?, ?, ?, ?)`,
          [
            productId,
            v.size.trim(),
            v.colour.trim(),
            parseInt(v.stock, 10),
          ]
        );
      }
    }

    await conn.commit();
    return await getAdminProductById(productId);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Update an existing product and synchronize variants safely
 */
async function updateProduct(id, updates) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Verify product exists
    const [existing] = await conn.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      const err = new Error(`Product with ID ${id} not found`);
      err.statusCode = 404;
      throw err;
    }

    // 2. Verify category if provided
    if (updates.category_id !== undefined) {
      const [catRows] = await conn.query('SELECT id FROM categories WHERE id = ?', [updates.category_id]);
      if (catRows.length === 0) {
        const err = new Error(`Category with ID ${updates.category_id} not found`);
        err.statusCode = 400;
        throw err;
      }
    }

    // 3. Update product fields
    const setFields = [];
    const setValues = [];

    if (updates.name !== undefined) {
      setFields.push('name = ?');
      setValues.push(updates.name.trim());
    }
    if (updates.category_id !== undefined) {
      setFields.push('category_id = ?');
      setValues.push(parseInt(updates.category_id, 10));
    }
    if (updates.description !== undefined) {
      setFields.push('description = ?');
      setValues.push(updates.description ? updates.description.trim() : null);
    }
    if (updates.price !== undefined) {
      setFields.push('price = ?');
      setValues.push(parseFloat(updates.price));
    }
    if (updates.image_url !== undefined) {
      setFields.push('image_url = ?');
      setValues.push(updates.image_url ? updates.image_url.trim() : null);
    }
    if (updates.is_active !== undefined) {
      setFields.push('is_active = ?');
      setValues.push(updates.is_active ? 1 : 0);
    }

    if (setFields.length > 0) {
      setValues.push(id);
      await conn.query(
        `UPDATE products SET ${setFields.join(', ')} WHERE id = ?`,
        setValues
      );
    }

    // 4. Update variants if provided
    if (updates.variants !== undefined && Array.isArray(updates.variants)) {
      // Validate incoming variants
      const seen = new Set();
      for (const v of updates.variants) {
        const sizeTrim = (v.size || '').trim();
        const colourTrim = (v.colour || '').trim();
        const stockInt = parseInt(v.stock, 10);

        if (!sizeTrim || !colourTrim) {
          const err = new Error('Each variant must have both a size and a colour');
          err.statusCode = 400;
          throw err;
        }

        if (isNaN(stockInt) || stockInt < 0) {
          const err = new Error('Variant stock must be an integer greater than or equal to 0');
          err.statusCode = 400;
          throw err;
        }

        const key = `${sizeTrim.toLowerCase()}|${colourTrim.toLowerCase()}`;
        if (seen.has(key)) {
          const err = new Error(`Duplicate variant: size "${sizeTrim}" and colour "${colourTrim}"`);
          err.statusCode = 400;
          throw err;
        }
        seen.add(key);
      }

      // Fetch currently existing variants for this product
      const [currentVariants] = await conn.query(
        'SELECT id, size, colour, stock FROM product_variants WHERE product_id = ?',
        [id]
      );

      const incomingIds = updates.variants
        .map((v) => (v.id ? parseInt(v.id, 10) : null))
        .filter(Boolean);

      // Check which existing variants were omitted
      const omittedVariants = currentVariants.filter((cv) => !incomingIds.includes(cv.id));

      for (const ov of omittedVariants) {
        // Check if referenced in order_items
        const [[{ count }]] = await conn.query(
          'SELECT COUNT(*) AS count FROM order_items WHERE variant_id = ?',
          [ov.id]
        );

        if (count > 0) {
          const err = new Error(
            `Variant (${ov.size}/${ov.colour}) cannot be deleted because it is referenced in past customer orders. Set its stock to 0 instead.`
          );
          err.statusCode = 409;
          throw err;
        } else {
          await conn.query('DELETE FROM product_variants WHERE id = ? AND product_id = ?', [ov.id, id]);
        }
      }

      // Upsert incoming variants
      for (const v of updates.variants) {
        const variantId = v.id ? parseInt(v.id, 10) : null;
        if (variantId && currentVariants.some((cv) => cv.id === variantId)) {
          // Update existing variant
          await conn.query(
            `UPDATE product_variants SET size = ?, colour = ?, stock = ? WHERE id = ? AND product_id = ?`,
            [v.size.trim(), v.colour.trim(), parseInt(v.stock, 10), variantId, id]
          );
        } else {
          // Insert new variant
          await conn.query(
            `INSERT INTO product_variants (product_id, size, colour, stock) VALUES (?, ?, ?, ?)`,
            [id, v.size.trim(), v.colour.trim(), parseInt(v.stock, 10)]
          );
        }
      }
    }

    await conn.commit();
    return await getAdminProductById(id);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/**
 * Delete or safely deactivate a product:
 * If referenced in order_items -> safely deactivates (is_active = 0) to preserve historical orders.
 * If not referenced in order_items and hard = true -> deletes product and its variants.
 * Default behavior -> deactivates.
 */
async function deleteProduct(id, { hard = false } = {}) {
  const [existing] = await db.query('SELECT id, name, is_active FROM products WHERE id = ?', [id]);
  if (existing.length === 0) {
    const err = new Error(`Product with ID ${id} not found`);
    err.statusCode = 404;
    throw err;
  }

  // Check if product is referenced in order_items
  const [[{ orderCount }]] = await db.query(
    'SELECT COUNT(*) AS orderCount FROM order_items WHERE product_id = ?',
    [id]
  );

  if (orderCount > 0) {
    // Cannot hard delete without breaking order referential integrity.
    // Perform safe deactivation.
    await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
    return {
      id: parseInt(id, 10),
      is_active: false,
      deactivated: true,
      message: 'Product has historical orders and was safely deactivated.',
    };
  }

  // If never ordered and hard delete requested:
  if (hard) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('DELETE FROM product_variants WHERE product_id = ?', [id]);
      await conn.query('DELETE FROM products WHERE id = ?', [id]);
      await conn.commit();
      return {
        id: parseInt(id, 10),
        deleted: true,
        message: 'Product permanently deleted.',
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  // Otherwise, safe deactivation by default
  await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
  return {
    id: parseInt(id, 10),
    is_active: false,
    deactivated: true,
    message: 'Product deactivated successfully.',
  };
}

/**
 * Add a single variant to an existing product
 */
async function addVariant(productId, { size, colour, stock }) {
  const [prod] = await db.query('SELECT id FROM products WHERE id = ?', [productId]);
  if (prod.length === 0) {
    const err = new Error(`Product with ID ${productId} not found`);
    err.statusCode = 404;
    throw err;
  }

  const sizeTrim = (size || '').trim();
  const colourTrim = (colour || '').trim();
  const stockInt = parseInt(stock, 10);

  if (!sizeTrim || !colourTrim) {
    const err = new Error('Size and colour are required');
    err.statusCode = 400;
    throw err;
  }

  if (isNaN(stockInt) || stockInt < 0) {
    const err = new Error('Stock must be an integer greater than or equal to 0');
    err.statusCode = 400;
    throw err;
  }

  // Check duplicate
  const [dup] = await db.query(
    'SELECT id FROM product_variants WHERE product_id = ? AND LOWER(size) = LOWER(?) AND LOWER(colour) = LOWER(?)',
    [productId, sizeTrim, colourTrim]
  );
  if (dup.length > 0) {
    const err = new Error(`Variant with size "${sizeTrim}" and colour "${colourTrim}" already exists for this product`);
    err.statusCode = 409;
    throw err;
  }

  const [res] = await db.query(
    'INSERT INTO product_variants (product_id, size, colour, stock) VALUES (?, ?, ?, ?)',
    [productId, sizeTrim, colourTrim, stockInt]
  );

  return {
    id: res.insertId,
    product_id: parseInt(productId, 10),
    size: sizeTrim,
    colour: colourTrim,
    stock: stockInt,
  };
}

/**
 * Update a single variant
 */
async function updateVariant(productId, variantId, { size, colour, stock }) {
  const [vRows] = await db.query(
    'SELECT id, size, colour, stock FROM product_variants WHERE id = ? AND product_id = ?',
    [variantId, productId]
  );
  if (vRows.length === 0) {
    const err = new Error(`Variant with ID ${variantId} not found for product ${productId}`);
    err.statusCode = 404;
    throw err;
  }

  const current = vRows[0];
  const newSize = size !== undefined ? (size || '').trim() : current.size;
  const newColour = colour !== undefined ? (colour || '').trim() : current.colour;
  const newStock = stock !== undefined ? parseInt(stock, 10) : current.stock;

  if (!newSize || !newColour) {
    const err = new Error('Size and colour cannot be empty');
    err.statusCode = 400;
    throw err;
  }

  if (isNaN(newStock) || newStock < 0) {
    const err = new Error('Stock must be an integer greater than or equal to 0');
    err.statusCode = 400;
    throw err;
  }

  // Check duplicate against other variants
  const [dup] = await db.query(
    'SELECT id FROM product_variants WHERE product_id = ? AND LOWER(size) = LOWER(?) AND LOWER(colour) = LOWER(?) AND id != ?',
    [productId, newSize, newColour, variantId]
  );
  if (dup.length > 0) {
    const err = new Error(`Variant with size "${newSize}" and colour "${newColour}" already exists`);
    err.statusCode = 409;
    throw err;
  }

  await db.query(
    'UPDATE product_variants SET size = ?, colour = ?, stock = ? WHERE id = ? AND product_id = ?',
    [newSize, newColour, newStock, variantId, productId]
  );

  return {
    id: parseInt(variantId, 10),
    product_id: parseInt(productId, 10),
    size: newSize,
    colour: newColour,
    stock: newStock,
  };
}

/**
 * Delete a single variant safely:
 * Fails with 409 Conflict if referenced in order_items.
 */
async function deleteVariant(productId, variantId) {
  const [vRows] = await db.query(
    'SELECT id, size, colour FROM product_variants WHERE id = ? AND product_id = ?',
    [variantId, productId]
  );
  if (vRows.length === 0) {
    const err = new Error(`Variant with ID ${variantId} not found for product ${productId}`);
    err.statusCode = 404;
    throw err;
  }

  const v = vRows[0];

  // Check order_items reference
  const [[{ count }]] = await db.query(
    'SELECT COUNT(*) AS count FROM order_items WHERE variant_id = ?',
    [variantId]
  );

  if (count > 0) {
    const err = new Error(
      `Cannot delete variant (${v.size}/${v.colour}) as it is referenced in past customer orders. Set its stock to 0 instead.`
    );
    err.statusCode = 409;
    throw err;
  }

  await db.query('DELETE FROM product_variants WHERE id = ? AND product_id = ?', [variantId, productId]);

  return {
    id: parseInt(variantId, 10),
    deleted: true,
    message: 'Variant deleted successfully',
  };
}

module.exports = {
  getAdminProducts,
  getAdminProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
};
