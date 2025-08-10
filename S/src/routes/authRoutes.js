// src/routes/authRoutes.js: Handles user registration and login.
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const sellerModel = require("../models/sellerModel");
const AppError = require("../utils/AppError");
const config = require("../config/config");
const db = require("../config/db"); // Needed for transactions
const logger = require("../utils/logger");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /sm/auth/register/customer
router.post("/register/customer", async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber, address } = req.body;
    if (!name || !email || !password || !phoneNumber) {
      return next(
        new AppError(
          "Missing required customer registration fields (name, email, password, phoneNumber).",
          400
        )
      );
    }
    const password_hash = await bcrypt.hash(password, 12);
    // Role ID 1 is for 'CUSTOMER' as per schema
    const newUserId = await userModel.createUser(
      // Call without connection, outside transaction
      name,
      email,
      password_hash,
      phoneNumber,
      address,
      1
    );
    logger.info(`Customer registered: ${email} (UserID: ${newUserId})`);
    // Log this action
    await require("../models/logModel").createLog({
      actionType: "CUSTOMER_REGISTERED",
      entityType: "USER",
      entityId: newUserId,
      details: { email: email, name: name },
      ipAddress: req.ip,
    });

    res.status(201).json({
      status: "success",
      message: "Customer registered successfully. Please log in.",
    });
  } catch (error) {
    next(error); // Pass to error middleware
  }
});

// POST /sm/auth/register/seller
router.post("/register/seller", async (req, res, next) => {
  const connection = await db.getConnection(); // Get a connection for transaction
  let newUserId = null; // Declare outside try for logging in catch
  try {
    const {
      name,
      email,
      password,
      phoneNumber,
      shopName,
      businessName,
      businessEmail,
      businessPhoneNumber,
      address,
    } = req.body;
    if (
      !name ||
      !email ||
      !password ||
      !phoneNumber ||
      !shopName ||
      !businessEmail ||
      !businessPhoneNumber
    ) {
      return next(
        new AppError("Missing required seller registration fields.", 400)
      );
    }

    await connection.beginTransaction(); // Start transaction

    const password_hash = await bcrypt.hash(password, 12);
    // Role ID 2 is for 'SELLER'
    newUserId = await userModel.createUser(
      // Pass connection for transactional scope
      name,
      email,
      password_hash,
      phoneNumber,
      address,
      2,
      connection // Pass connection
    );

    const newSellerId = await sellerModel.createSeller(
      newUserId,
      {
        // Pass connection for transactional scope
        shop_name: shopName,
        business_name: businessName,
        business_email: businessEmail,
        business_phone_number: businessPhoneNumber,
        address: address,
        contract_status: "PENDING", // Default status
      },
      connection
    ); // Pass connection

    await connection.commit(); // Commit transaction if all successful
    logger.info(
      `Seller registration initiated for: ${email} (Shop: ${shopName}, UserID: ${newUserId}, SellerID: ${newSellerId})`
    );
    // Log this action
    await require("../models/logModel").createLog({
      actionType: "SELLER_REGISTERED",
      entityType: "SELLER",
      entityId: newSellerId,
      details: { email: email, shopName: shopName },
      ipAddress: req.ip,
      userId: newUserId, // Link to the user who became a seller
    });

    res.status(201).json({
      status: "success",
      message: "Seller registered successfully. Awaiting admin approval.",
    });
  } catch (error) {
    await connection.rollback(); // Rollback on error
    logger.error(
      `Seller registration transaction failed for ${email}. Rolling back.`,
      error
    ); // Log rollback
    next(error); // Pass to error middleware
  } finally {
    connection.release(); // Always release connection
  }
});

// POST /sm/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("Please provide email and password.", 400));
    }

    const user = await userModel.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return next(new AppError("Invalid email or password.", 401));
    }

    if (!user.is_active) {
      return next(
        new AppError(
          "Your account has been deactivated. Please contact support.",
          403
        )
      );
    }

    // Include user role in the JWT payload to simplify client-side logic
    const token = jwt.sign(
      { userId: user.user_id, role: user.role_name },
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_EXPIRATION,
      }
    );
    logger.info(`User logged in: ${email} (Role: ${user.role_name})`);

    // Log this action
    await require("../models/logModel").createLog({
      userId: user.user_id,
      actionType: "USER_LOGIN",
      entityType: "USER",
      entityId: user.user_id,
      ipAddress: req.ip,
    });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        jwtToken: token,
        userId: user.user_id,
        role: user.role_name, // Include the user's role
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /sm/auth/logout - Simple client-side logout (no server-side invalidation)
router.post("/logout", authenticateToken, async (req, res, next) => {
  // Made async for logModel call
  logger.info(`User ${req.user.userId} logged out.`);
  // Log this action
  try {
    await require("../models/logModel").createLog({
      userId: req.user.userId,
      actionType: "USER_LOGOUT",
      entityType: "USER",
      entityId: req.user.userId,
      ipAddress: req.ip,
    });
  } catch (logError) {
    logger.error("Failed to log user logout:", logError);
  }

  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully." });
});

module.exports = router;
