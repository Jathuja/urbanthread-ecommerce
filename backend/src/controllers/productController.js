const productService = require('../services/productService');

async function getProducts(req, res, next) {
  try {
    const { search, category, size, colour, minPrice, maxPrice, sort, limit } = req.query;

    const products = await productService.getProducts({
      search,
      category,
      size,
      colour,
      minPrice,
      maxPrice,
      sort,
      limit,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
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

module.exports = {
  getProducts,
  getProductById,
};
