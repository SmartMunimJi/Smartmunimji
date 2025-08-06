// src/middleware/errorMiddleware.js: Global error handling middleware.
const logger = require("../utils/logger");
const AppError = require("../utils/AppError");

module.exports = (err, req, res, next) => {
  let error = { ...err }; // Create a copy to avoid modifying the original error object
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || "error";

  // Specific MySQL Duplicate Entry Error Handling
  if (err.code === "ER_DUP_ENTRY") {
    const fieldMatch = err.sqlMessage.match(/for key '(.*?)'/);
    let message = "A record with this value already exists.";
    if (fieldMatch && fieldMatch[1]) {
      // Improve message based on common unique keys in schema
      const keyName = fieldMatch[1];
      if (keyName.includes("email") || keyName.includes("phone")) {
        message = `This ${keyName.split("_")[0]} is already registered.`;
      } else if (keyName === "uk_customer_seller_order") {
        message =
          "This product has already been registered by you for this seller and order.";
      } else if (keyName === "role_name") {
        message = `The role name '${
          err.sqlMessage.match(/'([^']*)'/)[1]
        }' already exists.`;
      } else {
        message = `Duplicate entry for ${keyName}.`;
      }
    }
    error = new AppError(message, 409);
  } else if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token. Please log in again.", 401);
  } else if (err.name === "TokenExpiredError") {
    error = new AppError("Your token has expired. Please log in again.", 401);
  } else if (!(err instanceof AppError)) {
    // Catch all other unexpected errors
    error = new AppError(
      "An unexpected server error occurred. Please try again later.",
      500
    );
    logger.error("UNEXPECTED SERVER ERROR:", err.stack); // Log full stack trace for unexpected errors
  } else {
    // If it's an AppError, log its message
    logger.error(`OPERATIONAL ERROR: ${error.message}`);
  }

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};
