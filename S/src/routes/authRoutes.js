// src/routes/authRoutes.js: Handles user registration and login.
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const sellerModel = require("../models/sellerModel");
const AppError = require("../utils/AppError");
const config = require("../config/config");
const db = require("../config/db"); // For transactions
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
    await userModel.createUser(
      name,
      email,
      password_hash,
      phoneNumber,
      address,
      1
    );
    logger.info(`Customer registered: ${email}`);
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
    const userId = await userModel.createUser(
      name,
      email,
      password_hash,
      phoneNumber,
      address,
      2
    );

    await sellerModel.createSeller(userId, {
      shop_name: shopName,
      business_name: businessName,
      business_email: businessEmail,
      business_phone_number: businessPhoneNumber,
      address: address,
      contract_status: "PENDING", // Default status
    });

    await connection.commit(); // Commit transaction if all successful
    logger.info(
      `Seller registration initiated for: ${email} (Shop: ${shopName})`
    );
    res.status(201).json({
      status: "success",
      message: "Seller registered successfully. Awaiting admin approval.",
    });
  } catch (error) {
    await connection.rollback(); // Rollback on error
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

    const token = jwt.sign({ userId: user.user_id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRATION,
    });
    logger.info(`User logged in: ${email} (Role: ${user.role_name})`);
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
router.post("/logout", authenticateToken, (req, res) => {
  logger.info(`User ${req.user.userId} logged out.`);
  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully." });
});

module.exports = router;
