// src/middleware/authMiddleware.js: Handles JWT verification and role-based access control.
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const AppError = require("../utils/AppError");
const db = require("../config/db");
const logger = require("../utils/logger"); // Using logger now

const authenticateToken = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("Authentication required: No token provided.", 401)
    );
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Fetch user details including role_name and seller_id (if applicable) from DB
    // This ensures the role is current and the user is active
    const [userRows] = await db.execute(
      `
        SELECT u.user_id, u.is_active, r.role_name, s.seller_id 
        FROM users u 
        JOIN roles r ON u.role_id = r.role_id 
        LEFT JOIN sellers s ON u.user_id = s.user_id 
        WHERE u.user_id = ?`,
      [decoded.userId]
    );
    const currentUser = userRows[0];

    if (!currentUser) {
      return next(
        new AppError(
          "Authentication failed: User not found for this token.",
          401
        )
      );
    }
    if (!currentUser.is_active) {
      return next(
        new AppError(
          "Your account is currently inactive. Please contact support.",
          403
        )
      );
    }

    // Attach user details to the request object for later use in routes
    req.user = {
      userId: currentUser.user_id,
      role: currentUser.role_name,
      ...(currentUser.seller_id && { sellerId: currentUser.seller_id }), // Conditionally add sellerId if available
    };
    logger.debug(
      `User ${req.user.userId} (Role: ${req.user.role}) authenticated.`
    );
    next();
  } catch (err) {
    logger.warn(`JWT authentication error: ${err.message}`);
    // Let the errorMiddleware handle the specific JWT error types
    next(err);
  }
};

// Middleware to authorize specific roles
const authorizeRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      logger.warn(
        `User ${req.user?.userId} (Role: ${
          req.user?.role
        }) attempted unauthorized access to role-restricted route. Required roles: ${allowedRoles.join(
          ", "
        )}`
      );
      return next(
        new AppError(
          "Authorization failed: You do not have the necessary permissions for this action.",
          403
        )
      );
    }
    next();
  };

module.exports = { authenticateToken, authorizeRole };
