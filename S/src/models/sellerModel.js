// src/models/sellerModel.js: Handles all direct database operations for the `sellers` table.
const db = require("../config/db"); // Global db pool

const sellerModel = {
  // Pass 'conn' for transactional operations, otherwise use 'db' pool
  createSeller: async (userId, data, conn = db) => {
    // Added conn parameter
    // Explicitly convert potentially undefined fields to null for SQL compatibility
    const shop_name = data.shop_name;
    const business_name = data.business_name || null;
    const business_email = data.business_email;
    const business_phone_number = data.business_phone_number;
    const address = data.address || null;
    const contract_status = data.contract_status || "PENDING"; // Default if not provided
    const api_base_url = data.api_base_url || null; // This was the likely culprit for admin create seller
    const api_key = data.api_key || null; // This was the likely culprit for admin create seller

    const sql = `INSERT INTO sellers (user_id, shop_name, business_name, business_email, business_phone_number, address, contract_status, api_base_url, api_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await conn.execute(sql, [
      // Use conn.execute
      userId,
      shop_name,
      business_name,
      business_email,
      business_phone_number,
      address,
      contract_status,
      api_base_url,
      api_key,
    ]);
    return result.insertId;
  },

  findSellerById: async (sellerId) => {
    const [rows] = await db.execute(
      "SELECT * FROM sellers WHERE seller_id = ?",
      [sellerId]
    );
    return rows[0];
  },

  findSellerByUserId: async (userId) => {
    const [rows] = await db.execute("SELECT * FROM sellers WHERE user_id = ?", [
      userId,
    ]);
    return rows[0];
  },

  getActiveSellers: async () => {
    const sql = `SELECT seller_id AS sellerId, shop_name AS shopName FROM sellers WHERE contract_status = 'ACTIVE' ORDER BY shop_name`;
    const [rows] = await db.execute(sql);
    return rows;
  },

  getSellersByCustomerId: async (customerUserId) => {
    const sql = `
        SELECT DISTINCT s.seller_id AS sellerId, s.shop_name AS shopName
        FROM sellers s
        JOIN customer_registered_products crp ON s.seller_id = crp.seller_id
        WHERE crp.customer_user_id = ?
        ORDER BY s.shop_name`;
    const [rows] = await db.execute(sql, [customerUserId]);
    return rows;
  },

  updateSellerProfile: async (sellerId, data, conn = db) => {
    // Added conn parameter
    const fields = [];
    const values = [];
    // Only add fields that are explicitly provided in the data object
    if (data.shop_name !== undefined) {
      fields.push("shop_name = ?");
      values.push(data.shop_name);
    }
    if (data.business_name !== undefined) {
      fields.push("business_name = ?");
      values.push(data.business_name || null);
    } // Handle nullable
    if (data.business_email !== undefined) {
      fields.push("business_email = ?");
      values.push(data.business_email);
    }
    if (data.business_phone_number !== undefined) {
      fields.push("business_phone_number = ?");
      values.push(data.business_phone_number);
    }
    if (data.address !== undefined) {
      fields.push("address = ?");
      values.push(data.address || null);
    } // Handle nullable
    if (data.api_base_url !== undefined) {
      fields.push("api_base_url = ?");
      values.push(data.api_base_url || null);
    } // Handle nullable
    if (data.api_key !== undefined) {
      fields.push("api_key = ?");
      values.push(data.api_key || null);
    } // Handle nullable
    if (data.contract_status !== undefined) {
      fields.push("contract_status = ?");
      values.push(data.contract_status);
    }

    if (fields.length === 0) return 0; // No fields to update

    const sql = `UPDATE sellers SET ${fields.join(", ")} WHERE seller_id = ?`;
    values.push(sellerId);
    const [result] = await conn.execute(sql, values); // Use conn.execute
    return result.affectedRows;
  },

  updateSellerContractStatus: async (sellerId, contractStatus, conn = db) => {
    // Added conn parameter
    const sql = `UPDATE sellers SET contract_status = ? WHERE seller_id = ?`;
    const [result] = await conn.execute(sql, [contractStatus, sellerId]); // Use conn.execute
    return result.affectedRows;
  },

  getSellerProfile: async (sellerId) => {
    try {
      const [rows] = await db.execute(
        `SELECT
        s.shop_name AS shopName,
        s.business_name AS businessName,
        s.business_email AS businessEmail,
        s.business_phone_number AS businessPhoneNumber,
        s.address,
        s.contract_status AS contractStatus
      FROM sellers s
      WHERE s.seller_id = ?`,
        [sellerId]
      );
      return rows[0] || null; // Return the first row or null if not found
    } catch (error) {
      throw new AppError(
        `Database error fetching seller profile: ${error.message}`,
        500
      );
    }
  },

  getAllSellers: async () => {
    const sql = `
        SELECT
            seller_id AS sellerId, shop_name AS shopName, business_name AS businessName,
            business_email AS businessEmail, business_phone_number AS businessPhoneNumber,
            address, contract_status AS contractStatus, api_base_url AS apiBaseUrl, api_key AS apiKey
        FROM sellers
        ORDER BY created_at DESC`;
    const [rows] = await db.execute(sql);
    return rows;
  },

  getSellerStatistics: async (sellerId) => {
    try {
      // --- Products Registered ---
      const [productsCountResult] = await db.execute(
        `SELECT COUNT(*) AS totalProductsRegistered FROM customer_registered_products WHERE seller_id = ?`,
        [sellerId]
      );
      const totalProductsRegistered =
        productsCountResult[0].totalProductsRegistered;

      // --- Claims by Status ---
      const [claimsStatusResult] = await db.execute(
        `SELECT claim_status, COUNT(*) AS count FROM warranty_claims wc
       JOIN customer_registered_products crp ON wc.registered_product_id = crp.registered_product_id
       WHERE crp.seller_id = ?
       GROUP BY claim_status`,
        [sellerId]
      );

      const claimsByStatus = {
        total: 0,
        REQUESTED: 0,
        ACCEPTED: 0,
        DENIED: 0,
        IN_PROGRESS: 0,
        RESOLVED: 0,
      };

      claimsStatusResult.forEach((row) => {
        const status = row.claim_status.toUpperCase();
        claimsByStatus[status] = row.count;
        claimsByStatus.total += row.count;
      });

      return {
        totalProductsRegistered,
        activeWarrantyClaims:
          claimsByStatus.REQUESTED + claimsByStatus.IN_PROGRESS, // Sum of REQUESTED and IN_PROGRESS
        acceptedWarrantyClaims: claimsByStatus.ACCEPTED,
        deniedWarrantyClaims: claimsByStatus.DENIED,
        resolvedWarrantyClaims: claimsByStatus.RESOLVED,
        inProgressWarrantyClaims: claimsByStatus.IN_PROGRESS, // Add this explicitly for clarity
      };
    } catch (error) {
      throw new AppError(
        `Database error fetching seller statistics: ${error.message}`,
        500
      );
    }
  },
};

module.exports = sellerModel;
