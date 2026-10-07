/**
 * Validation middleware for Admin Product and Variant endpoints.
 */

function validateCreateProduct(req, res, next) {
  const { name, category_id, categoryId, price, description, image_url, is_active, variants } = req.body;

  // 1. Name validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Product name is required and must be a non-empty string',
    });
  }

  if (name.trim().length > 255) {
    return res.status(400).json({
      success: false,
      message: 'Product name cannot exceed 255 characters',
    });
  }

  // 2. Category ID validation (accepts category_id or categoryId)
  const catId = category_id !== undefined ? category_id : categoryId;
  const numCatId = Number(catId);
  if (!Number.isInteger(numCatId) || numCatId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'A valid positive integer category_id is required',
    });
  }
  // Standardize to category_id
  req.body.category_id = numCatId;

  // 3. Price validation
  const numPrice = Number(price);
  if (price === undefined || price === null || isNaN(numPrice) || numPrice <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Price is required, must be numeric and greater than zero',
    });
  }
  if (numPrice > 9999999.99) {
    return res.status(400).json({
      success: false,
      message: 'Price exceeds maximum permissible limit',
    });
  }
  req.body.price = parseFloat(numPrice.toFixed(2));

  // 4. Image URL validation (if provided)
  if (image_url !== undefined && image_url !== null && image_url !== '') {
    if (typeof image_url !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Image URL must be a valid string',
      });
    }
    const trimmedUrl = image_url.trim();
    if (trimmedUrl.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Image URL cannot exceed 1000 characters',
      });
    }
    // Check if it starts with http://, https://, or /
    const isUrlOrPath = /^https?:\/\//i.test(trimmedUrl) || trimmedUrl.startsWith('/');
    if (!isUrlOrPath) {
      return res.status(400).json({
        success: false,
        message: 'Image URL must be a valid web URL (http/https) or relative path starting with /',
      });
    }
    req.body.image_url = trimmedUrl;
  }

  // 5. Variants validation (if provided)
  if (variants !== undefined) {
    if (!Array.isArray(variants)) {
      return res.status(400).json({
        success: false,
        message: 'Variants must be an array of variant objects',
      });
    }

    const seen = new Set();
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v || typeof v !== 'object') {
        return res.status(400).json({
          success: false,
          message: `Variant at index ${i} is invalid`,
        });
      }

      if (!v.size || typeof v.size !== 'string' || v.size.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: `Variant at index ${i} is missing a valid size`,
        });
      }

      if (!v.colour || typeof v.colour !== 'string' || v.colour.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: `Variant at index ${i} is missing a valid colour`,
        });
      }

      const stockNum = Number(v.stock);
      if (v.stock === undefined || !Number.isInteger(stockNum) || stockNum < 0) {
        return res.status(400).json({
          success: false,
          message: `Variant (${v.size}/${v.colour}) must have an integer stock of 0 or greater`,
        });
      }

      const key = `${v.size.trim().toLowerCase()}|${v.colour.trim().toLowerCase()}`;
      if (seen.has(key)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate variant detected: size "${v.size.trim()}" and colour "${v.colour.trim()}"`,
        });
      }
      seen.add(key);
    }
  }

  next();
}

function validateUpdateProduct(req, res, next) {
  const { id } = req.params;
  const numId = Number(id);

  if (!Number.isInteger(numId) || numId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID: ID must be a positive integer',
    });
  }

  const { name, category_id, categoryId, price, image_url, variants } = req.body;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product name cannot be empty',
      });
    }
    if (name.trim().length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Product name cannot exceed 255 characters',
      });
    }
  }

  const catId = category_id !== undefined ? category_id : categoryId;
  if (catId !== undefined) {
    const numCatId = Number(catId);
    if (!Number.isInteger(numCatId) || numCatId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Category ID must be a positive integer',
      });
    }
    req.body.category_id = numCatId;
  }

  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be numeric and greater than zero',
      });
    }
    req.body.price = parseFloat(numPrice.toFixed(2));
  }

  if (image_url !== undefined && image_url !== null && image_url !== '') {
    if (typeof image_url !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Image URL must be a valid string',
      });
    }
    const trimmed = image_url.trim();
    const isUrlOrPath = /^https?:\/\//i.test(trimmed) || trimmed.startsWith('/');
    if (!isUrlOrPath) {
      return res.status(400).json({
        success: false,
        message: 'Image URL must be a valid web URL or path starting with /',
      });
    }
    req.body.image_url = trimmed;
  }

  if (variants !== undefined) {
    if (!Array.isArray(variants)) {
      return res.status(400).json({
        success: false,
        message: 'Variants must be an array',
      });
    }

    const seen = new Set();
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v || typeof v !== 'object') {
        return res.status(400).json({
          success: false,
          message: `Variant at index ${i} is invalid`,
        });
      }

      if (!v.size || typeof v.size !== 'string' || v.size.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: `Variant at index ${i} is missing a valid size`,
        });
      }

      if (!v.colour || typeof v.colour !== 'string' || v.colour.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: `Variant at index ${i} is missing a valid colour`,
        });
      }

      const stockNum = Number(v.stock);
      if (v.stock === undefined || !Number.isInteger(stockNum) || stockNum < 0) {
        return res.status(400).json({
          success: false,
          message: `Variant (${v.size}/${v.colour}) must have an integer stock of 0 or greater`,
        });
      }

      const key = `${v.size.trim().toLowerCase()}|${v.colour.trim().toLowerCase()}`;
      if (seen.has(key)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate variant detected: size "${v.size.trim()}" and colour "${v.colour.trim()}"`,
        });
      }
      seen.add(key);
    }
  }

  next();
}

function validateVariantPayload(req, res, next) {
  const isPut = req.method === 'PUT';
  const { size, colour, stock } = req.body;

  if (isPut) {
    if (size === undefined && colour === undefined && stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (size, colour, or stock) must be provided for update',
      });
    }

    if (size !== undefined) {
      if (typeof size !== 'string' || size.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Variant size must be a non-empty string',
        });
      }
      req.body.size = size.trim();
    }

    if (colour !== undefined) {
      if (typeof colour !== 'string' || colour.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Variant colour must be a non-empty string',
        });
      }
      req.body.colour = colour.trim();
    }

    if (stock !== undefined) {
      const stockNum = Number(stock);
      if (!Number.isInteger(stockNum) || stockNum < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock must be an integer greater than or equal to 0',
        });
      }
      req.body.stock = stockNum;
    }

    return next();
  }

  // POST: require all 3 fields
  if (!size || typeof size !== 'string' || size.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Variant size is required and must be a non-empty string',
    });
  }

  if (!colour || typeof colour !== 'string' || colour.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Variant colour is required and must be a non-empty string',
    });
  }

  const stockNum = Number(stock);
  if (stock === undefined || !Number.isInteger(stockNum) || stockNum < 0) {
    return res.status(400).json({
      success: false,
      message: 'Stock must be an integer greater than or equal to 0',
    });
  }

  req.body.size = size.trim();
  req.body.colour = colour.trim();
  req.body.stock = stockNum;

  next();
}

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
  validateVariantPayload,
};
