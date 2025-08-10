// server.js (Shyaam Electronics Backend)
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config(); // Loads environment variables from .env file

const app = express();

// --- Middleware ---
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Body parser for JSON requests

// --- MySQL Connection Pool ---
// Using a pool is a best practice for managing database connections efficiently.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // If true, the pool will queue connections if no free connection is available.
  connectionLimit: 10, // Maximum number of connections to create at once.
  queueLimit: 0, // The maximum number of connection requests the pool will queue.
});

// --- Helper Function ---
/**
 * Formats a Date object or date string into a consistent 'YYYY-MM-DD' string.
 * This ensures precise date comparison regardless of input format or timezones.
 * @param {Date|string} date - The date to format.
 * @returns {string|null} The formatted date string, or null if input is invalid.
 */
function formatDateToYYYYMMDD(date) {
  if (!date) return null;
  try {
    const d = new Date(date);
    // Check if the date is valid (e.g., handles "Invalid Date" case)
    if (isNaN(d.getTime())) {
      return null;
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed (0-11)
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Error formatting date:", e);
    return null;
  }
}

// --- Custom Middleware ---

/**
 * Validates that the shop name in the URL matches the one in the .env file.
 */
const validateShopName = (req, res, next) => {
  const { shopName } = req.params;
  if (shopName !== process.env.SHOP_NAME) {
    return res
      .status(400)
      .json({ status: "error", message: `Invalid shop name: ${shopName}` });
  }
  next();
};

/**
 * Authenticates requests from Smart Munim Ji using a secret API key in the header.
 * Expected Header: X-SmartMunimJi-API-Key: YOUR_API_KEY
 */
const authenticateSMJ = (req, res, next) => {
  const apiKey = req.header("X-SmartMunimJi-API-Key")?.trim(); // Correct header name
  if (!apiKey || apiKey !== process.env.SMJ_API_KEY) {
    return res.status(401).json({
      status: "error",
      code: "UNAUTHORIZED_API_KEY",
      message: "Authentication failed: Invalid or missing API Key.",
    });
  }
  next();
};

// =================================================================
// API ENDPOINTS
// =================================================================

// --- Internal Seller Endpoint: Add a New Sale Record ---
// This endpoint is used by the seller to add new sales to their database.
// Example Body:
// {
//     "orderId": "SHE-ORD-2024-5001",
//     "customerName": "Neha Singh",
//     "customerPhoneNumber": "+919876543210",
//     "productPrice": 24999.00,
//     "dateOfPurchase": "2024-07-20",
//     "warrantyPeriodMonths": 12,
//     "sellerInternalProductSku": "SMARTPHONE-XY2"
// }
app.post("/:shopName/api/v1/sales", validateShopName, async (req, res) => {
  const {
    orderId,
    customerName,
    customerPhoneNumber,
    productPrice,
    dateOfPurchase,
    warrantyPeriodMonths,
    sellerInternalProductSku,
  } = req.body;

  // 1. Input Validation
  if (
    !orderId ||
    !customerName ||
    !customerPhoneNumber ||
    !productPrice ||
    !dateOfPurchase ||
    !warrantyPeriodMonths ||
    !sellerInternalProductSku
  ) {
    return res
      .status(400)
      .json({ status: "error", message: "Missing required fields." });
  }

  try {
    // 2. Data Integrity Check: Verify that the product SKU exists
    const [products] = await pool.query(
      "SELECT 1 FROM seller_products WHERE sku = ?",
      [sellerInternalProductSku.trim()]
    );
    if (products.length === 0) {
      return res.status(404).json({
        status: "error",
        code: "PRODUCT_SKU_NOT_FOUND",
        message: `Product with SKU '${sellerInternalProductSku}' not found. Cannot create sale.`,
      });
    }

    // 3. Duplicate Order Check (order_id + customer_phone_number as composite key)
    const [existing] = await pool.query(
      "SELECT 1 FROM seller_orders WHERE order_id = ? AND customer_phone_number = ?",
      [orderId.trim(), customerPhoneNumber.trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        status: "error",
        message: `Order with ID '${orderId}' for this customer already exists.`,
      });
    }

    // 4. Insert new sale record
    await pool.execute(
      `INSERT INTO seller_orders (order_id, customer_name, customer_phone_number, product_price, date_of_purchase, warranty_period_months, seller_internal_product_sku)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId.trim(),
        customerName.trim(),
        customerPhoneNumber.trim(),
        productPrice,
        dateOfPurchase, // Ensure this is 'YYYY-MM-DD' string from client
        warrantyPeriodMonths,
        sellerInternalProductSku.trim(),
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Sale record created successfully.",
      orderId,
    });
  } catch (error) {
    console.error("Error creating sale record:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error during sale record creation.",
    });
  }
});

// --- Internal Seller Endpoint: Get All Sale Records ---
// This endpoint allows the seller to view their complete sales history.
app.get("/:shopName/api/v1/sales", validateShopName, async (req, res) => {
  try {
    // We JOIN with seller_products to include the product name for a more useful response.
    const [rows] = await pool.query(`
      SELECT
        o.*,
        p.name AS product_name
      FROM seller_orders o
      JOIN seller_products p ON o.seller_internal_product_sku = p.sku
      ORDER BY o.date_of_purchase DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching sales records:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error fetching sales records.",
    });
  }
});

// --- External Endpoint: Validate Purchase (for Smart Munim Ji) ---
// This secure endpoint is exposed to Smart Munim Ji for purchase validation.
// Expected Body:
// {
//     "orderId": "SHE-ORD-2024-5001",
//     "customerPhoneNumber": "+919876543210",
//     "purchaseDate": "2024-07-20"
// }
// Expected Header: X-SmartMunimJi-API-Key: YOUR_API_KEY
app.post(
  "/:shopName/api/v1/validate-purchase",
  validateShopName,
  authenticateSMJ,
  async (req, res) => {
    const { orderId, customerPhoneNumber, purchaseDate } = req.body;

    if (!orderId || !customerPhoneNumber || !purchaseDate) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_REQUEST_PARAMS",
        message:
          "Missing 'orderId', 'customerPhoneNumber', or 'purchaseDate' in request body.",
      });
    }

    try {
      // Fetch the order details, including product name and price from seller_products
      const [rows] = await pool.query(
        `SELECT
            o.order_id,
            o.date_of_purchase,
            o.warranty_period_months,
            p.name AS product_name,       -- Fetched product name from seller_products
            p.price AS product_price,     -- Fetched product price from seller_products
            o.customer_phone_number       -- The authoritative customer phone from order record
         FROM seller_orders o
         JOIN seller_products p ON o.seller_internal_product_sku = p.sku
         WHERE o.order_id = ? AND o.customer_phone_number = ?`,
        [orderId.trim(), customerPhoneNumber.trim()]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          status: "error",
          code: "PURCHASE_NOT_FOUND",
          message:
            "No matching purchase found with provided order ID and phone number.",
        });
      }

      const order = rows[0];

      // IMPORTANT: Use the helper function for consistent date formatting for comparison
      const providedPurchaseDateFormatted = formatDateToYYYYMMDD(purchaseDate);
      const actualPurchaseDateFormatted = formatDateToYYYYMMDD(
        order.date_of_purchase
      );

      if (providedPurchaseDateFormatted !== actualPurchaseDateFormatted) {
        console.log(
          `[DEBUG - Date Mismatch]: Provided='${providedPurchaseDateFormatted}', Actual='${actualPurchaseDateFormatted}' for Order ID: ${orderId}`
        );
        return res.status(400).json({
          status: "error",
          code: "DATE_MISMATCH",
          message:
            "Provided purchase date does not match our records for this order and customer. Please verify the date.",
        });
      }

      // Calculate warranty expiry date based on the authoritative purchase date from DB
      const purchaseDateObj = new Date(order.date_of_purchase);
      const expiryDate = new Date(
        purchaseDateObj.setMonth(
          purchaseDateObj.getMonth() + order.warranty_period_months
        )
      );
      // Format to YYYY-MM-DD for consistency with Smart Munim Ji's table
      const warrantyExpiryDateFormatted = formatDateToYYYYMMDD(expiryDate);
      const authoritativePurchaseDateFormatted = formatDateToYYYYMMDD(
        order.date_of_purchase
      );

      // Construct the response object to match Smart Munim Ji's expected input for product registration
      const responseData = {
        productName: order.product_name,
        price: order.product_price,
        authoritativePurchaseDate: authoritativePurchaseDateFormatted,
        warrantyPeriodMonths: order.warranty_period_months,
        customerPhoneNumber: order.customer_phone_number, // Use the one from the sales record
      };

      res.status(200).json({
        status: "success",
        message: "Purchase validated successfully.",
        data: responseData,
      });
    } catch (error) {
      console.error("Error validating purchase:", error);
      res.status(500).json({
        status: "error",
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred during purchase validation.",
      });
    }
  }
);

// --- Global Error Handling Middleware ---
// Catches any unhandled errors in the application to prevent server crashes
// and provide a consistent error response format.
app.use((err, req, res, next) => {
  console.error("Unhandled error in Shyaam Electronics backend:", err);
  // Default to 500 Internal Server Error for unhandled exceptions
  res.status(500).json({
    status: "error",
    message:
      "An unexpected internal server error occurred in seller system. Please try again later.",
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 5050; // Use port from .env or default to 5050
app.listen(PORT, () => {
  console.log(
    `✅ Server for '${
      process.env.SHOP_NAME || "Shyaam Electronics"
    }' is running on port ${PORT}`
  );
});
