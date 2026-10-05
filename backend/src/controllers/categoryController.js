const categoryService = require('../services/categoryService');

async function getCategories(req, res, next) {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
};
