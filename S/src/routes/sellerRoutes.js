// src/routes/sellerRoutes.js: Handles all API endpoints for seller users.
const express = require("express");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const sellerModel = require("../models/sellerModel");
const productModel = require("../models/productModel");
const claimModel = require("../models/claimModel");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const router = express.Router();

// Apply authentication and seller role authorization to all routes in this file
router.use(authenticateToken, authorizeRole("SELLER"));

// Helper to get sellerId from req.user
router.use(async (req, res, next) => {
  if (!req.user.sellerId) {
    const seller = await sellerModel.findSellerByUserId(req.user.userId);
    if (seller) {
      req.user.sellerId = seller.seller_id;
    } else {
      logger.warn(
        `User ${req.user.userId} (role: ${req.user.role}) is authenticated as SELLER but has no linked sellerId.`
      );
      return next(
        new AppError(
          "No seller profile associated with this user account.",
          403
        )
      );
    }
  }
  next();
});

// GET /sm/seller/profile - Get Seller Profile Details (Moved to correct place, ensure no duplicates)
router.get("/profile", async (req, res, next) => {
  try {
    const sellerProfile = await sellerModel.getSellerProfile(req.user.sellerId);
    if (!sellerProfile) {
      return next(new AppError("Seller profile not found.", 404));
    }
    res.status(200).json({
      status: "success",
      message: "Seller profile fetched successfully.",
      data: sellerProfile,
    });
  } catch (error) {
    logger.error(
      `Error fetching seller profile for seller ${req.user.sellerId}:`,
      error
    );
    next(error);
  }
});

// PUT /sm/seller/profile - Update Seller Profile
router.put("/profile", async (req, res, next) => {
  try {
    const {
      shopName,
      businessName,
      address,
      businessEmail,
      businessPhoneNumber,
    } = req.body;
    const updateData = {};
    if (shopName !== undefined) updateData.shop_name = shopName;
    if (businessName !== undefined) updateData.business_name = businessName;
    if (address !== undefined) updateData.address = address;
    if (businessEmail !== undefined) updateData.business_email = businessEmail;
    if (businessPhoneNumber !== undefined)
      updateData.business_phone_number = businessPhoneNumber;

    if (Object.keys(updateData).length === 0) {
      return next(
        new AppError("No valid fields provided for seller profile update.", 400)
      );
    }

    const affectedRows = await sellerModel.updateSellerProfile(
      req.user.sellerId,
      updateData
    );
    if (affectedRows === 0) {
      const sellerFound = await sellerModel.findSellerById(req.user.sellerId);
      if (!sellerFound) {
        return next(new AppError("Seller profile not found.", 404));
      }
      res.status(200).json({
        status: "success",
        message: "Seller profile updated successfully (or no changes needed).",
      });
      return;
    }
    logger.info(`Seller ${req.user.sellerId} updated their profile.`);
    res.status(200).json({
      status: "success",
      message: "Seller profile updated successfully.",
    });
  } catch (error) {
    next(error);
  }
});

// POST /sm/seller/deactivate-request - Request Seller Account Deactivation
router.post("/deactivate-request", async (req, res, next) => {
  try {
    const affectedRows = await sellerModel.updateSellerContractStatus(
      req.user.sellerId,
      "DEACTIVATED"
    );
    if (affectedRows === 0) {
      const sellerFound = await sellerModel.findSellerById(req.user.sellerId);
      if (!sellerFound) {
        return next(new AppError("Seller not found.", 404));
      }
      res.status(200).json({
        status: "success",
        message:
          "Seller account deactivation requested successfully (or already DEACTIVATED).",
      });
      return;
    }
    logger.info(`Seller ${req.user.sellerId} requested account deactivation.`);
    res.status(200).json({
      status: "success",
      message:
        "Seller account deactivation requested successfully. Admin will review.",
    });
  } catch (error) {
    next(error);
  }
});

// GET /sm/seller/products - View Registered Products (for Seller's Shop)
router.get("/products", async (req, res, next) => {
  try {
    const products = await productModel.getProductsBySellerId(
      req.user.sellerId
    );
    res.status(200).json({
      status: "success",
      message: "Products registered for your shop fetched successfully.",
      data: products,
    });
  } catch (error) {
    next(error);
  }
});

// GET /sm/seller/claims - View Warranty Claims (for Seller's Products)
router.get("/claims", async (req, res, next) => {
  try {
    const claims = await claimModel.getClaimsBySellerId(req.user.sellerId);
    res.status(200).json({
      status: "success",
      message: "Warranty claims for your products fetched successfully.",
      data: claims,
    });
  } catch (error) {
    next(error);
  }
});

// GET /sm/seller/claims/:claimId - Get Single Claim Details
router.get("/claims/:claimId", async (req, res, next) => {
  try {
    const { claimId } = req.params; // This is a string from URL
    // --- FIX: Pass claimId (string) to claimModel.getClaimDetails ---
    const claim = await claimModel.getClaimDetails(claimId);

    if (!claim) {
      return next(new AppError("Claim not found.", 404));
    }

    // Verify that the claim belongs to a product from THIS seller
    // --- FIX: Use correct property name from claim object: registered_product_id ---
    const product = await productModel.findProductById(
      claim.registered_product_id // Use the database column name from claim object
    );
    if (!product || product.seller_id !== req.user.sellerId) {
      return next(
        new AppError(
          "Forbidden: This claim does not belong to your shop's products.",
          403
        )
      );
    }

    res.status(200).json({
      status: "success",
      message: "Claim details fetched successfully.",
      data: claim,
    });
  } catch (error) {
    logger.error(
      `Error fetching claim ${req.params.claimId} for seller ${req.user.sellerId}:`,
      error
    );
    next(error);
  }
});

// PUT /sm/seller/claims/:claimId - Manage Warranty Claim Status (Accept/Decline)
router.put("/claims/:claimId", async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const { claimStatus, sellerResponseNotes } = req.body;
    const validStatuses = [
      "REQUESTED",
      "ACCEPTED",
      "DENIED",
      "IN_PROGRESS",
      "RESOLVED",
    ];

    if (!claimStatus || !validStatuses.includes(claimStatus)) {
      return next(
        new AppError(
          `Invalid claim status. Must be one of: ${validStatuses.join(", ")}.`,
          400
        )
      );
    }
    if (
      claimStatus === "DENIED" &&
      (!sellerResponseNotes || sellerResponseNotes.trim() === "")
    ) {
      return next(
        new AppError("Response notes are required when denying a claim.", 400)
      );
    }

    // --- FIX: Pass claimId (string) to claimModel.getClaimDetails ---
    const claim = await claimModel.getClaimDetails(claimId);
    if (!claim) {
      return next(new AppError("Claim not found.", 404));
    }

    // Verify that the claim belongs to a product from THIS seller
    // --- FIX: Use correct property name from claim object: registered_product_id ---
    const product = await productModel.findProductById(
      claim.registered_product_id
    );
    if (!product || product.seller_id !== req.user.sellerId) {
      return next(
        new AppError(
          "Forbidden: This claim does not belong to your shop's products.",
          403
        )
      );
    }

    const affectedRows = await claimModel.updateClaimStatus(
      claimId, // Pass claimId as received
      claimStatus,
      sellerResponseNotes
    );
    if (affectedRows === 0) {
      res.status(200).json({
        status: "success",
        message: "Claim status updated successfully (or no changes needed).",
      });
      return;
    }
    logger.info(
      `Seller ${req.user.sellerId} updated claim ${claimId} to ${claimStatus}.`
    );
    res.status(200).json({
      status: "success",
      message: "Claim status updated successfully.",
    });
  } catch (error) {
    next(error);
  }
});

// GET /sm/seller/statistics - View Seller Statistics
router.get("/statistics", async (req, res, next) => {
  try {
    const stats = await sellerModel.getSellerStatistics(req.user.sellerId);
    res.status(200).json({
      status: "success",
      message: "Seller statistics fetched successfully.",
      data: stats,
    });
  } catch (error) {
    logger.error(
      `Error fetching seller statistics for seller ${req.user.sellerId}:`,
      error
    );
    next(error);
  }
});

module.exports = router;
