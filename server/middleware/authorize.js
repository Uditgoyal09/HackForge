const { ApiError } = require('../utils/ApiError');

/**
 * Middleware to restrict access to specific roles.
 * Must be used AFTER authMiddleware (protect).
 * @param  {...string} roles - roles authorized to access the route
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, `User role ${req.user?.role} is not authorized to access this route`);
    }
    next();
  };
};

module.exports = authorize;
