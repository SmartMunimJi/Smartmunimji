// src/models/sellerModel.js: Handles all direct database operations for the `sellers` table.
const db = require("../config/db");

const sellerModel = {
  createSeller: async (userId, data) => {
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
    const [result] = await db.execute(sql, [
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

  updateSellerProfile: async (sellerId, data) => {
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
    const [result] = await db.execute(sql, values);
    return result.affectedRows;
  },

  updateSellerContractStatus: async (sellerId, contractStatus) => {
    const sql = `UPDATE sellers SET contract_status = ? WHERE seller_id = ?`;
    const [result] = await db.execute(sql, [contractStatus, sellerId]);
    return result.affectedRows;
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
    const [products] = await db.execute(
      `SELECT COUNT(*) AS totalProductsRegistered FROM customer_registered_products WHERE seller_id = ?`,
      [sellerId]
    );
    const [claims] = await db.execute(
      `SELECT claim_status, COUNT(*) AS count 
           FROM warranty_claims wc
           JOIN customer_registered_products crp ON wc.registered_product_id = crp.registered_product_id
           WHERE crp.seller_id = ?
           GROUP BY claim_status`,
      [sellerId]
    );

    const stats = {
      totalProductsRegistered: products[0]?.totalProductsRegistered || 0,
      activeWarrantyClaims: 0,
      acceptedWarrantyClaims: 0,
      deniedWarrantyClaims: 0,
      resolvedWarrantyClaims: 0,
      inProgressWarrantyClaims: 0,
    };

    claims.forEach((c) => {
      if (c.claim_status === "REQUESTED") stats.activeWarrantyClaims = c.count;
      else if (c.claim_status === "ACCEPTED")
        stats.acceptedWarrantyClaims = c.count;
      else if (c.claim_status === "DENIED")
        stats.deniedWarrantyClaims = c.count;
      else if (c.claim_status === "RESOLVED")
        stats.resolvedWarrantyClaims = c.count;
      else if (c.claim_status === "IN_PROGRESS")
        stats.inProgressWarrantyClaims = c.count;
    });

    return stats;
  },
};

module.exports = sellerModel;
