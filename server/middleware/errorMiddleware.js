const mongoose = require('mongoose');
const { ApiError } = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle malformed JSON body from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or malformed JSON request payload',
    });
  }

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (err instanceof mongoose.Error ? 400 : 500);
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  const statusCode = error.statusCode || 500;

  const response = {
    success: false,
    message: error.message || 'Internal Server Error',
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  };

  return res.status(statusCode).json(response);
};

module.exports = { errorHandler };
