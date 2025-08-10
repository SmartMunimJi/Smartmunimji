// src/models/productModel.js: Handles all direct database operations for the `customer_registered_products` table.
const db = require("../config/db");
const AppError = require("../utils/AppError");

const productModel = {
  registerProduct: async (data) => {
    const customer_user_id = data.customer_user_id;
    const seller_id = data.seller_id;
    const seller_order_id = data.seller_order_id;
    const seller_customer_phone_at_sale = data.seller_customer_phone_at_sale;
    const product_name = data.product_name;
    const product_price = data.product_price || null; // product_price is NULLABLE
    const date_of_purchase = data.date_of_purchase;
    const warranty_valid_until = data.warranty_valid_until;

    const sql = `INSERT INTO customer_registered_products (customer_user_id, seller_id, seller_order_id, seller_customer_phone_at_sale, product_name, product_price, date_of_purchase, warranty_valid_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      customer_user_id,
      seller_id,
      seller_order_id,
      seller_customer_phone_at_sale,
      product_name,
      product_price,
      date_of_purchase,
      warranty_valid_until,
    ]);
    return result.insertId;
  },

  findProductByCustomerAndOrder: async (
    customer_user_id,
    seller_id,
    seller_order_id
  ) => {
    const [rows] = await db.execute(
      "SELECT * FROM customer_registered_products WHERE customer_user_id = ? AND seller_id = ? AND seller_order_id = ?",
      [customer_user_id, seller_id, seller_order_id]
    );
    return rows[0];
  },

  // FIX: Corrected parameter name to registered_product_id
  findProductById: async (registered_product_id) => {
    if (registered_product_id == null) {
      // Use the corrected parameter name here too
      throw new AppError(
        "Product ID cannot be null or undefined for findProductById.",
        400
      );
    }
    try {
      const [rows] = await db.execute(
        `SELECT
        crp.registered_product_id,
        crp.customer_user_id,
        crp.seller_id,
        crp.seller_order_id,
        crp.seller_customer_phone_at_sale,
        crp.product_name,
        crp.product_price,
        crp.date_of_purchase,
        crp.warranty_valid_until,
        crp.is_warranty_eligible
      FROM customer_registered_products crp
      WHERE crp.registered_product_id = ?`,
        [registered_product_id] // Use the corrected parameter name
      );
      return rows[0] || null;
    } catch (error) {
      throw new AppError(
        `Database error finding product by ID: ${error.message}`,
        500
      );
    }
  },

  getProductsByCustomerId: async (customer_user_id) => {
    const sql = `
        SELECT 
            crp.registered_product_id AS registeredProductId, 
            crp.product_name AS productName, 
            s.shop_name AS shopName, 
            crp.seller_order_id AS sellerOrderId, 
            crp.date_of_purchase AS dateOfPurchase, 
            crp.warranty_valid_until AS warrantyValidUntil, 
            (crp.warranty_valid_until >= CURDATE()) AS isWarrantyEligible, 
            DATEDIFF(crp.warranty_valid_until, CURDATE()) AS daysRemaining
        FROM customer_registered_products crp 
        JOIN sellers s ON crp.seller_id = s.seller_id 
        WHERE crp.customer_user_id = ? 
        ORDER BY crp.date_of_purchase DESC`;
    const [rows] = await db.execute(sql, [customer_user_id]);
    return rows;
  },

  getProductsBySellerId: async (seller_id) => {
    const sql = `
          SELECT 
              crp.registered_product_id AS registeredProductId, 
              u.name AS customerName, 
              u.phone_number AS customerPhoneNumber,
              crp.product_name AS productName, 
              crp.seller_order_id AS sellerOrderId, 
              crp.date_of_purchase AS dateOfPurchase, 
              crp.warranty_valid_until AS warrantyValidUntil, 
              (crp.warranty_valid_until >= CURDATE()) AS isWarrantyEligible
          FROM customer_registered_products crp 
          JOIN users u ON crp.customer_user_id = u.user_id 
          WHERE crp.seller_id = ?
          ORDER BY crp.created_at DESC`;
    const [rows] = await db.execute(sql, [seller_id]);
    return rows;
  },
};

module.exports = productModel;
