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

// PUT /sm/customer/profile - Update Customer Profile
router.put("/profile", async (req, res, next) => {
  try {
    const { name, address } = req.body;
    if (!name && !address) {
      return next(
        new AppError(
          "No fields provided to update. Please provide name or address.",
          400
        )
      );
    }
    const updated = await userModel.updateUserProfile(req.user.userId, {
      name,
      address,
    });
    if (!updated) {
      return next(
        new AppError("Customer profile not found or no changes made.", 404)
      ); // Unlikely if authenticated
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
      !seller.api_base_url ||
      !seller.api_key
    ) {
      return next(
        new AppError(
          "Seller not found or is not active/configured for API validation.",
          404
        )
      );
    }

    const customerUser = await userModel.findUserById(req.user.userId); // Get phone number for validation

    // --- External Seller API Call for Validation ---
    let validationResponseData;
    const validationUrl = `${seller.api_base_url}/sm/validate-purchase`; // Updated path as per requirement
    logger.info(
      `Calling Seller API: POST ${validationUrl} for order ${orderId}`
    );

    try {
      const response = await fetch(validationUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": seller.api_key, // Seller's API key
        },
        body: JSON.stringify({
          orderId: orderId,
          customerPhone: customerUser.phone_number, // Pass customer's current phone number
          purchaseDate: purchaseDate, // Customer's claimed purchase date
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
        return next(new AppError(errorMessage, 424)); // 424 Failed Dependency
      }

      validationResponseData = responseBody.data;
      logger.info(`Seller API validation successful for order ${orderId}.`);
    } catch (apiError) {
      logger.error(
        `Error connecting to seller API for validation (sellerId: ${sellerId}): ${apiError.message}`
      );
      return next(
        new AppError(
          "Could not connect to the seller's system for validation. Please try again later.",
          424
        )
      );
    }
    // --- End External API Call ---

    const { authoritativePurchaseDate, warrantyPeriodMonths, ...productInfo } =
      validationResponseData;
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
      seller_customer_phone_at_sale: productInfo.customerPhoneNumber, // From seller's API
      product_name: productInfo.productName,
      product_price: productInfo.price,
      date_of_purchase: authoritativePurchaseDate,
      warranty_valid_until: warrantyEndDate.toISOString().split("T")[0], // YYYY-MM-DD format
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
    res.status(200).json({
      status: "success",
      message: "Registered products fetched successfully.",
      data: products,
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
          "This product is no longer eligible for a warranty claim.",
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

// GET /sm/customer/claims/:claimId - Get Warranty Claim Status
router.get("/claims/:claimId", async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const claim = await claimModel.getClaimDetails(claimId);
    if (!claim) {
      return next(new AppError("Warranty claim not found.", 404));
    }

    // Verify that the claim belongs to the authenticated user's product
    const product = await productModel.findProductById(
      claim.registeredProductId
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
    next(error);
  }
});

module.exports = router;
