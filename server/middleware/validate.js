const { ApiError } = require('../utils/ApiError');

const validate = (schema) => async (req, res, next) => {
  try {
    // Parse uses zod to validate the schema against the request body/query/params
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    const errors = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    // Returning 422 Unprocessable Entity for validation failures
    next(new ApiError(422, 'Validation failed', errors));
  }
};

module.exports = validate;
