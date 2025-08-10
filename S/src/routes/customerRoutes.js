// src/routes/customerRoutes.js: Handles all API endpoints for customer users.
const express = require("express");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const userModel = require("../models/userModel");
const sellerModel = require("../models/sellerModel");
const productModel = require("../models/productModel");
const claimModel = require("../models/claimModel");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const fetch = require("node-fetch"); // For external seller API calls

const router = express.Router();

// Apply authentication and customer role authorization to all routes in this file
router.use(authenticateToken, authorizeRole("CUSTOMER"));

// GET /sm/customer/profile - Get Customer Profile
router.get("/profile", async (req, res, next) => {
  try {
    const customerProfile = await userModel.findUserById(req.user.userId);
    if (!customerProfile) {
      return next(new AppError("Customer profile not found.", 404));
    }
    // Only return relevant profile data (exclude password_hash)
    const { password_hash, role_id, ...profileData } = customerProfile;
    res.status(200).json({
      status: "success",
      message: "Customer profile fetched successfully.",
      data: profileData,
    });
  } catch (error) {
    logger.error(
      `Error fetching customer profile for user ${req.user.userId}:`,
      error
    );
    next(error);
  }
});

// PUT /sm/customer/profile - Update Customer Profile
router.put("/profile", async (req, res, next) => {
  try {
    const { name, address } = req.body;
    if (name === undefined && address === undefined) {
      // Check for undefined, not just falsy
      return next(
        new AppError(
          "No fields provided to update. Please provide name or address.",
          400
        )
      );
    }
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;

    const affectedRows = await userModel.updateUserProfile(
      req.user.userId,
      updateData
    );
    if (affectedRows === 0) {
      const userFound = await userModel.findUserById(req.user.userId);
      if (!userFound) {
        return next(new AppError("Customer profile not found.", 404));
      }
      res.status(200).json({
        status: "success",
        message: "Profile updated successfully (or no changes needed).",
      });
      return;
    }
    logger.info(`Customer ${req.user.userId} updated their profile.`);
    res
      .status(200)
      .json({ status: "success", message: "Profile updated successfully." });
  } catch (error) {
    next(error);
  }
});

// GET /sm/customer/sellers - Get All Active Sellers (for dropdown)
router.get("/sellers", async (req, res, next) => {
  try {
    const sellers = await sellerModel.getActiveSellers();
    res.status(200).json({
      status: "success",
      message: "Active sellers fetched successfully.",
      data: sellers,
    });
  } catch (error) {
    next(error);
  }
});

// POST /sm/customer/products/register - Register a Product
router.post("/products/register", async (req, res, next) => {
  try {
    const { sellerId, orderId, purchaseDate } = req.body;
    if (!sellerId || !orderId || !purchaseDate) {
      return next(
        new AppError(
          "Missing required fields: sellerId, orderId, purchaseDate.",
          400
        )
      );
    }
    if (new Date(purchaseDate) > new Date()) {
      return next(new AppError("Purchase date cannot be in the future.", 400));
    }

    const existingProduct = await productModel.findProductByCustomerAndOrder(
      req.user.userId,
      sellerId,
      orderId
    );
    if (existingProduct) {
      return next(
        new AppError(
          "This product has already been registered by you for this seller and order.",
          409
        )
      );
    }

    const seller = await sellerModel.findSellerById(sellerId);
    if (
      !seller ||
      seller.contract_status !== "ACTIVE" ||
      !seller.api_base_url || // This should now contain the FULL validation endpoint
      !seller.api_key
    ) {
      return next(
        new AppError(
          "Seller not found or is not active/configured for API validation. Please contact admin.",
          404
        )
      );
    }

    const customerUser = await userModel.findUserById(req.user.userId);

    // --- External Seller API Call for Validation ---
    let validationResponseData;
    const validationUrl = seller.api_base_url; // Use the full URL stored in api_base_url
    logger.info(
      `Calling Seller API: POST ${validationUrl} for order ${orderId}`
    );

    try {
      const response = await fetch(validationUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-SmartMunimJi-API-Key": seller.api_key,
        },
        body: JSON.stringify({
          orderId: orderId,
          customerPhoneNumber: customerUser.phone_number,
          purchaseDate: purchaseDate,
        }),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        logger.warn(
          `Seller API validation failed for order ${orderId}: ${
            response.status
          } - ${JSON.stringify(responseBody)}`
        );
        const errorMessage =
          responseBody.message ||
          "Purchase details could not be validated with the seller. Please verify your order ID and purchase date.";
        return next(new AppError(errorMessage, 424));
      }

      validationResponseData = responseBody.data;
      if (
        !validationResponseData ||
        !validationResponseData.productName ||
        !validationResponseData.price ||
        !validationResponseData.authoritativePurchaseDate ||
        !validationResponseData.warrantyPeriodMonths ||
        !validationResponseData.customerPhoneNumber
      ) {
        return next(
          new AppError(
            "Seller API response missing crucial product data (productName, price, purchaseDate, warrantyPeriodMonths, customerPhoneNumber). Please contact admin.",
            424
          )
        );
      }

      logger.info(`Seller API validation successful for order ${orderId}.`);
    } catch (apiError) {
      logger.error(
        `Error connecting to seller API for validation (sellerId: ${sellerId}): ${apiError.message}`
      );
      return next(
        new AppError(
          "Could not connect to the seller's system for validation. Please ensure the seller API is running and accessible.",
          424
        )
      );
    }

    const {
      productName,
      price,
      authoritativePurchaseDate,
      warrantyPeriodMonths,
      customerPhoneNumber,
    } = validationResponseData;

    const purchaseDateObj = new Date(authoritativePurchaseDate);
    const warrantyEndDate = new Date(
      new Date(purchaseDateObj).setMonth(
        purchaseDateObj.getMonth() + warrantyPeriodMonths
      )
    );

    const newProductData = {
      customer_user_id: req.user.userId,
      seller_id: sellerId,
      seller_order_id: orderId,
      seller_customer_phone_at_sale: customerPhoneNumber,
      product_name: productName,
      product_price: price,
      date_of_purchase: authoritativePurchaseDate,
      warranty_valid_until: warrantyEndDate.toISOString().split("T")[0],
    };

    const registeredProductId = await productModel.registerProduct(
      newProductData
    );
    logger.info(
      `Product ${newProductData.product_name} registered by customer ${req.user.userId} for seller ${sellerId}.`
    );

    res.status(201).json({
      status: "success",
      message: "Product registered successfully.",
      data: {
        registeredProductId: registeredProductId,
        productName: newProductData.product_name,
        warrantyValidUntil: newProductData.warranty_valid_until,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /sm/customer/products - View All Registered Products for Customer
router.get("/products", async (req, res, next) => {
  try {
    const products = await productModel.getProductsByCustomerId(
      req.user.userId
    );
    const formattedProducts = products.map((p) => ({
      ...p,
      daysRemaining: Math.max(0, p.daysRemaining || 0),
    }));

    res.status(200).json({
      status: "success",
      message: "Registered products fetched successfully.",
      data: formattedProducts,
    });
  } catch (error) {
    next(error);
  }
});

// GET /sm/customer/my-sellers - Get Sellers with Customer's Registered Products
router.get("/my-sellers", async (req, res, next) => {
  try {
    const mySellers = await sellerModel.getSellersByCustomerId(req.user.userId);
    res.status(200).json({
      status: "success",
      message: "My sellers fetched successfully.",
      data: mySellers,
    });
  } catch (error) {
    next(error);
  }
});

// POST /sm/customer/claims - Claim Warranty
router.post("/claims", async (req, res, next) => {
  try {
    const { registeredProductId, issueDescription } = req.body;
    if (!registeredProductId || !issueDescription) {
      return next(
        new AppError(
          "Registered Product ID and Issue Description are required for a claim.",
          400
        )
      );
    }

    const product = await productModel.findProductById(registeredProductId);
    if (!product) {
      return next(new AppError("Registered product not found.", 404));
    }
    if (product.customer_user_id !== req.user.userId) {
      return next(
        new AppError(
          "Forbidden: This product does not belong to your account.",
          403
        )
      );
    }

    const isWarrantyEligible =
      new Date(product.warranty_valid_until) >= new Date();
    if (!isWarrantyEligible) {
      return next(
        new AppError(
          "This product is no longer eligible for a warranty claim as warranty period has expired.",
          400
        )
      );
    }

    const existingActiveClaim = await claimModel.findActiveClaimByProduct(
      registeredProductId
    );
    if (existingActiveClaim) {
      return next(
        new AppError(
          `An active claim (Status: ${existingActiveClaim.claim_status}) already exists for this product.`,
          409
        )
      );
    }

    const claimId = await claimModel.createClaim({
      registered_product_id: registeredProductId,
      customer_user_id: req.user.userId,
      issue_description: issueDescription,
    });
    logger.info(
      `Warranty claim ${claimId} submitted by customer ${req.user.userId} for product ${registeredProductId}.`
    );
    res.status(201).json({
      status: "success",
      message:
        "Warranty claim submitted successfully. Seller has been notified.",
    });
  } catch (error) {
    next(error);
  }
});

// GET /sm/customer/claims - Get All Claims for Customer
router.get("/claims", async (req, res, next) => {
  try {
    const claims = await claimModel.getClaimsByCustomerId(req.user.userId);
    res.status(200).json({
      status: "success",
      message: "Warranty claims for your products fetched successfully.",
      data: claims,
    });
  } catch (error) {
    logger.error(
      `Error fetching claims for customer ${req.user.userId}:`,
      error
    );
    next(error);
  }
});

// GET /sm/customer/claims/:claimId - Get Single Claim Details for Customer
router.get("/claims/:claimId", async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const claim = await claimModel.getClaimDetails(claimId);
    if (!claim) {
      return next(new AppError("Warranty claim not found.", 404));
    }

    // Verify that the claim belongs to the authenticated user's product
    // --- FIX: Corrected property access from claim object ---
    const product = await productModel.findProductById(
      claim.registered_product_id // Use the database column name as returned by claimModel
    );
    if (!product || product.customer_user_id !== req.user.userId) {
      return next(
        new AppError(
          "Forbidden: This claim does not belong to your account.",
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
      `Error fetching claim ${req.params.claimId} for customer ${req.user.userId}:`,
      error
    );
    next(error);
  }
});

module.exports = router;
