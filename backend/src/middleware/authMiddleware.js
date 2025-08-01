const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorHandler");

module.exports = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorResponse("No token provided", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return next(new ErrorResponse("User not found", 401));
    }
    next();
  } catch (error) {
    return next(new ErrorResponse("Invalid token", 401));
  }
};
