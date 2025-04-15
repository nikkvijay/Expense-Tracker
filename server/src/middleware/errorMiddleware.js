const ErrorResponse = require("../utils/errorHandler");

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  let statusCode = 500;
  let message = "Internal Server Error";

  // Handle ErrorResponse instances
  if (err instanceof ErrorResponse) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Mongoose errors
  else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = errorHandler;
