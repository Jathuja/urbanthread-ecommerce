/**
 * Middleware to validate query parameters for GET /api/products
 */
function validateProductQuery(req, res, next) {
  const { minPrice, maxPrice } = req.query;

  if (minPrice !== undefined && minPrice !== '') {
    const min = parseFloat(minPrice);
    if (isNaN(min) || min < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameter: minPrice must be a non-negative number',
      });
    }
  }

  if (maxPrice !== undefined && maxPrice !== '') {
    const max = parseFloat(maxPrice);
    if (isNaN(max) || max < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameter: maxPrice must be a non-negative number',
      });
    }
  }

  if (
    minPrice !== undefined &&
    minPrice !== '' &&
    maxPrice !== undefined &&
    maxPrice !== ''
  ) {
    if (parseFloat(minPrice) > parseFloat(maxPrice)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameter: minPrice cannot be greater than maxPrice',
      });
    }
  }

  next();
}

/**
 * Middleware to validate product ID parameter
 */
function validateProductId(req, res, next) {
  const { id } = req.params;
  const numId = Number(id);

  if (!Number.isInteger(numId) || numId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product ID: ID must be a positive integer',
    });
  }

  next();
}

module.exports = {
  validateProductQuery,
  validateProductId,
};
