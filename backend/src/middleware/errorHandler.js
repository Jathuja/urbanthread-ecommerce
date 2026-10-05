/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Unhandled server error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
