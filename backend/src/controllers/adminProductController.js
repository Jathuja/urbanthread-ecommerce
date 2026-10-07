const adminProductService = require('../services/adminProductService');

/**
 * GET /api/admin/products
 * Fetch all products for admin panel with optional filters.
 */
async function getProducts(req, res, next) {
  try {
    const { search, category, status } = req.query;
    const products = await adminProductService.getAdminProducts({ search, category, status });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/products/:id
 * Retrieve a single product by ID (including inactive).
 */
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await adminProductService.getAdminProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/products
 * Create a new product with optional initial variants.
 */
async function createProduct(req, res, next) {
  try {
    const { name, description, category_id, price, image_url, is_active, variants } = req.body;
    const product = await adminProductService.createProduct({
      name,
      description,
      category_id,
      price,
      image_url,
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      variants,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/products/:id
 * Update an existing product and synchronize variants.
 */
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, category_id, price, image_url, is_active, variants } = req.body;

    const product = await adminProductService.updateProduct(id, {
      name,
      description,
      category_id,
      price,
      image_url,
      is_active,
      variants,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/products/:id
 * Delete or safely deactivate a product.
 */
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const hard = req.query.hard === 'true' || req.query.permanent === 'true';

    const result = await adminProductService.deleteProduct(id, { hard });

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/products/:id/variants
 * Add a new variant to a product.
 */
async function addVariant(req, res, next) {
  try {
    const { id } = req.params;
    const { size, colour, stock } = req.body;

    const variant = await adminProductService.addVariant(id, { size, colour, stock });

    res.status(201).json({
      success: true,
      message: 'Variant added successfully',
      data: variant,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/products/:id/variants/:variantId
 * Update an existing variant.
 */
async function updateVariant(req, res, next) {
  try {
    const { id, variantId } = req.params;
    const { size, colour, stock } = req.body;

    const variant = await adminProductService.updateVariant(id, variantId, { size, colour, stock });

    res.status(200).json({
      success: true,
      message: 'Variant updated successfully',
      data: variant,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/products/:id/variants/:variantId
 * Delete a variant (fails with 409 if referenced in order_items).
 */
async function deleteVariant(req, res, next) {
  try {
    const { id, variantId } = req.params;

    const result = await adminProductService.deleteVariant(id, variantId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
};
