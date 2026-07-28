const mongoose = require('mongoose');
const { ApiError } = require('../utils/ApiError');

const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
      throw new ApiError(400, `Invalid ID format for ${paramName}`);
    }
    next();
  };
};

module.exports = validateObjectId;
