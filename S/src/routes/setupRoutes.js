// src/routes/setupRoutes.js: Special route for initial application setup (e.g., first admin user).
const express = require("express");
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const db = require("../config/db"); // Needed to check existing roles/users

const router = express.Router();

// POST /sm/setup/register-admin
// This endpoint is for initial setup ONLY and should typically be disabled or removed after first use.
router.post("/register-admin", async (req, res, next) => {
  try {
    // Check if an ADMIN role user already exists
    const [existingAdmins] = await db.execute(`
            SELECT u.user_id FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE r.role_name = 'ADMIN'
        `);

    if (existingAdmins.length > 0) {
      logger.warn("Attempt to register admin when one already exists.");
      return next(
        new AppError(
          "An administrator account already exists. Admin registration can only be done once.",
          409
        )
      );
    }

    const { name, email, password, phoneNumber, address } = req.body;
    if (!name || !email || !password || !phoneNumber) {
      return next(
        new AppError("Missing required fields for admin registration.", 400)
      );
    }

    const password_hash = await bcrypt.hash(password, 12);
    const adminRoleId = 3; // Role ID 3 is for 'ADMIN' as per schema

    const newAdminUserId = await userModel.createUser(
      // No transaction needed here, it's a single operation
      name,
      email,
      password_hash,
      phoneNumber,
      address,
      adminRoleId
    );
    logger.info(
      `Initial admin registered: ${email} (UserID: ${newAdminUserId})`
    );
    // Log this action
    await require("../models/logModel").createLog({
      actionType: "ADMIN_REGISTERED_INITIALLY",
      entityType: "USER",
      entityId: newAdminUserId,
      details: { email: email, name: name },
      ipAddress: req.ip,
      userId: newAdminUserId, // This user is the admin who performed the action
    });

    res.status(201).json({
      status: "success",
      message:
        "Admin registered successfully. This endpoint should now be considered inactive.",
    });
  } catch (error) {
    next(error); // Pass to error middleware
  }
});

module.exports = router;
