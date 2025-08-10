// src/routes/adminRoutes.js: Handles all API endpoints for administrator users.
const express = require("express");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const userModel = require("../models/userModel");
const sellerModel = require("../models/sellerModel");
const logModel = require("../models/logModel"); // Log model imported
const claimModel = require("../models/claimModel"); // For platform stats
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const bcrypt = require("bcryptjs"); // For admin creating users/sellers
const db = require("../config/db"); // Import db for direct use in routes (transactions & stats)

const router = express.Router();

// Apply authentication and admin role authorization to all routes in this file
router.use(authenticateToken, authorizeRole("ADMIN"));

// GET /sm/admin/users - View All Users
router.get("/users", async (req, res, next) => {
  try {
    const users = await userModel.getAllUsers();
    res.status(200).json({
      status: "success",
      message: "All users fetched successfully.",
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /sm/admin/users/:userId/status - Activate/Deactivate User Account
router.put("/users/:userId/status", async (req, res, next) => {
  const connection = await db.getConnection(); // Get connection for transaction if needed, or just for direct model call with connection
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return next(
        new AppError("Invalid value for isActive. Must be true or false.", 400)
      );
    }
    if (parseInt(userId) === req.user.userId) {
      return next(
        new AppError("Admin cannot change their own active status.", 403)
      );
    }

    // Use the connection obtained for the update
    const affectedRows = await userModel.updateUserStatus(
      userId,
      isActive,
      connection
    );
    if (affectedRows === 0) {
      const userFound = await userModel.findUserById(userId);
      if (!userFound) {
        return next(new AppError("User not found.", 404));
      }
      res.status(200).json({
        status: "success",
        message:
          "User status updated successfully (or already in requested state).",
      });
      // Log regardless of affectedRows == 0, as it's still an admin action attempt
      await logModel.createLog({
        userId: req.user.userId,
        actionType: "USER_STATUS_UPDATE_NO_CHANGE",
        entityType: "USER",
        entityId: userId,
        details: { newStatus: isActive, performedByAdmin: req.user.userId },
        ipAddress: req.ip,
      });
      return;
    }
    logger.info(
      `Admin ${req.user.userId} changed status of user ${userId} to isActive: ${isActive}.`
    );
    await logModel.createLog({
      userId: req.user.userId,
      actionType: "USER_STATUS_UPDATED",
      entityType: "USER",
      entityId: userId,
      details: { newStatus: isActive, performedByAdmin: req.user.userId },
      ipAddress: req.ip,
    });
    res.status(200).json({
      status: "success",
      message: "User status updated successfully.",
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release(); // Ensure connection is released
  }
});

// GET /sm/admin/sellers - View All Sellers (Detailed)
router.get("/sellers", async (req, res, next) => {
  try {
    const sellers = await sellerModel.getAllSellers();
    res.status(200).json({
      status: "success",
      message: "All sellers fetched successfully.",
      data: sellers,
    });
  } catch (error) {
    next(error);
  }
});

// POST /sm/admin/sellers - Create Seller (Admin Manual Registration)
router.post("/sellers", async (req, res, next) => {
  const connection = await db.getConnection();
  let newUserId = null;
  let newSellerId = null;
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
      contractStatus,
      apiBaseUrl,
      apiKey,
    } = req.body;
    if (
      !name ||
      !email ||
      !password ||
      !phoneNumber ||
      !shopName ||
      !businessEmail ||
      !businessPhoneNumber ||
      !contractStatus
    ) {
      return next(
        new AppError("Missing required fields for admin seller creation.", 400)
      );
    }

    await connection.beginTransaction();
    const password_hash = await bcrypt.hash(password, 12);
    newUserId = await userModel.createUser(
      // Pass connection
      name,
      email,
      password_hash,
      phoneNumber,
      address,
      2, // Role 2 = SELLER
      connection
    );

    newSellerId = await sellerModel.createSeller(
      newUserId,
      {
        // Pass connection
        shop_name: shopName,
        business_name: businessName,
        business_email: businessEmail,
        business_phone_number: businessPhoneNumber,
        address: address,
        contract_status: contractStatus,
        api_base_url: apiBaseUrl,
        api_key: apiKey,
      },
      connection
    ); // Pass connection

    await connection.commit();
    logger.info(
      `Admin ${req.user.userId} created seller ${newSellerId} (${shopName}).`
    );
    await logModel.createLog({
      userId: req.user.userId,
      actionType: "SELLER_CREATED_BY_ADMIN",
      entityType: "SELLER",
      entityId: newSellerId,
      details: {
        email: email,
        shopName: shopName,
        contractStatus: contractStatus,
      },
      ipAddress: req.ip,
    });
    res.status(201).json({
      status: "success",
      message: "Seller created successfully by admin.",
      data: { sellerId: newSellerId },
    });
  } catch (error) {
    await connection.rollback();
    logger.error(`Admin seller creation failed. Rolling back.`, error);
    next(error);
  } finally {
    connection.release();
  }
});

// PUT /sm/admin/sellers/:sellerId - Edit Seller Details (Admin)
router.put("/sellers/:sellerId", async (req, res, next) => {
  const connection = await db.getConnection(); // Get connection for the update
  try {
    const { sellerId } = req.params;
    const {
      shopName,
      businessName,
      address,
      businessEmail,
      businessPhoneNumber,
      contractStatus,
      apiBaseUrl,
      apiKey,
    } = req.body;

    const updateData = {};
    if (shopName !== undefined) updateData.shop_name = shopName;
    if (businessName !== undefined) updateData.business_name = businessName;
    if (address !== undefined) updateData.address = address;
    if (businessEmail !== undefined) updateData.business_email = businessEmail;
    if (businessPhoneNumber !== undefined)
      updateData.business_phone_number = businessPhoneNumber;
    if (contractStatus !== undefined)
      updateData.contract_status = contractStatus;
    if (apiBaseUrl !== undefined) updateData.api_base_url = apiBaseUrl;
    if (apiKey !== undefined) updateData.api_key = apiKey;

    if (Object.keys(updateData).length === 0) {
      return next(
        new AppError("No valid fields provided for seller update.", 400)
      );
    }

    const affectedRows = await sellerModel.updateSellerProfile(
      sellerId,
      updateData,
      connection // Pass connection
    );
    if (affectedRows === 0) {
      const sellerFound = await sellerModel.findSellerById(sellerId);
      if (!sellerFound) {
        return next(new AppError("Seller not found.", 404));
      }
      res.status(200).json({
        status: "success",
        message: "Seller details updated successfully (or no changes needed).",
      });
      await logModel.createLog({
        userId: req.user.userId,
        actionType: "SELLER_UPDATE_NO_CHANGE",
        entityType: "SELLER",
        entityId: sellerId,
        details: { updateAttempt: req.body, performedByAdmin: req.user.userId },
        ipAddress: req.ip,
      });
      return;
    }
    logger.info(`Admin ${req.user.userId} updated seller ${sellerId} details.`);
    await logModel.createLog({
      userId: req.user.userId,
      actionType: "SELLER_UPDATED_BY_ADMIN",
      entityType: "SELLER",
      entityId: sellerId,
      details: { updates: req.body, performedByAdmin: req.user.userId },
      ipAddress: req.ip,
    });
    res.status(200).json({
      status: "success",
      message: "Seller details updated successfully.",
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// PUT /sm/admin/sellers/:sellerId/status - Manage Seller Contract Status
router.put("/sellers/:sellerId/status", async (req, res, next) => {
  const connection = await db.getConnection(); // Get connection for the update
  try {
    const { sellerId } = req.params;
    const { contractStatus } = req.body;
    const validStatuses = ["PENDING", "ACTIVE", "DEACTIVATED", "TERMINATED"];

    if (!contractStatus || !validStatuses.includes(contractStatus)) {
      return next(
        new AppError(
          `Invalid contract status. Must be one of: ${validStatuses.join(
            ", "
          )}.`,
          400
        )
      );
    }

    const affectedRows = await sellerModel.updateSellerContractStatus(
      sellerId,
      contractStatus,
      connection // Pass connection
    );
    if (affectedRows === 0) {
      const sellerFound = await sellerModel.findSellerById(sellerId);
      if (!sellerFound) {
        return next(new AppError("Seller not found.", 404));
      }
      res.status(200).json({
        status: "success",
        message:
          "Seller contract status updated successfully (or already in requested state).",
      });
      await logModel.createLog({
        userId: req.user.userId,
        actionType: "SELLER_CONTRACT_STATUS_NO_CHANGE",
        entityType: "SELLER",
        entityId: sellerId,
        details: {
          newStatus: contractStatus,
          performedByAdmin: req.user.userId,
        },
        ipAddress: req.ip,
      });
      return;
    }
    logger.info(
      `Admin ${req.user.userId} updated contract status of seller ${sellerId} to ${contractStatus}.`
    );
    await logModel.createLog({
      userId: req.user.userId,
      actionType: "SELLER_CONTRACT_STATUS_UPDATED",
      entityType: "SELLER",
      entityId: sellerId,
      details: { newStatus: contractStatus, performedByAdmin: req.user.userId },
      ipAddress: req.ip,
    });
    res.status(200).json({
      status: "success",
      message: "Seller contract status updated successfully.",
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

// GET /sm/admin/logs - View System Logs
router.get("/logs", async (req, res, next) => {
  try {
    const logs = await logModel.getLogs();
    res.status(200).json({
      status: "success",
      message: "System logs fetched successfully.",
      data: logs,
    });
  } catch (error) {
    next(error);
  }
});

// GET /sm/admin/statistics - View Platform Statistics (Admin)
router.get("/statistics", async (req, res, next) => {
  try {
    // Fetch user role counts
    const [userRoleCounts] = await db.execute(`
            SELECT r.role_name, COUNT(u.user_id) AS count
            FROM users u JOIN roles r ON u.role_id = r.role_id
            GROUP BY r.role_name
        `);

    // Fetch seller contract status counts
    const [sellerStatusCounts] = await db.execute(`
            SELECT contract_status, COUNT(*) AS count
            FROM sellers
            GROUP BY contract_status
        `);

    // Total products registered
    const [totalProductsResult] = await db.execute(
      `SELECT COUNT(*) AS total FROM customer_registered_products`
    );
    const totalProductsRegistered = totalProductsResult[0]?.total || 0;

    // Warranty claim status counts
    const claimStats = await claimModel.getPlatformClaimStats();

    const stats = {
      totalCustomers: 0,
      totalSellers: 0,
      activeSellers: 0,
      pendingSellers: 0,
      deactivatedSellers: 0,
      terminatedSellers: 0,
      totalProductsRegistered: totalProductsRegistered,
      totalWarrantyClaims: 0,
      claimsRequested: 0,
      claimsAccepted: 0,
      claimsDenied: 0,
      claimsInProgress: 0,
      claimsResolved: 0,
    };

    userRoleCounts.forEach((row) => {
      if (row.role_name === "CUSTOMER") stats.totalCustomers = row.count;
      // 'totalSellers' derived from sellerStatusCounts for accuracy
    });

    sellerStatusCounts.forEach((row) => {
      if (row.contract_status === "ACTIVE") stats.activeSellers = row.count;
      else if (row.contract_status === "PENDING")
        stats.pendingSellers = row.count;
      else if (row.contract_status === "DEACTIVATED")
        stats.deactivatedSellers = row.count;
      else if (row.contract_status === "TERMINATED")
        stats.terminatedSellers = row.count;
    });

    // Sum up total sellers from sellerStatusCounts to ensure it reflects actual seller entries
    stats.totalSellers = sellerStatusCounts.reduce(
      (sum, row) => sum + row.count,
      0
    );

    claimStats.forEach((row) => {
      stats.totalWarrantyClaims += row.count;
      if (row.claim_status === "REQUESTED") stats.claimsRequested = row.count;
      else if (row.claim_status === "ACCEPTED")
        stats.claimsAccepted = row.count;
      else if (row.claim_status === "DENIED") stats.claimsDenied = row.count;
      else if (row.claim_status === "IN_PROGRESS")
        stats.claimsInProgress = row.count;
      else if (row.claim_status === "RESOLVED")
        stats.claimsResolved = row.count;
    });

    res.status(200).json({
      status: "success",
      message: "Platform statistics fetched successfully.",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
