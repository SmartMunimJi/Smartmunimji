// src/models/claimModel.js: Handles all direct database operations for the `warranty_claims` table.
const db = require("../config/db");
const AppError = require("../utils/AppError");

const claimModel = {
  createClaim: async (data) => {
    const { registered_product_id, customer_user_id, issue_description } = data;
    const sql = `INSERT INTO warranty_claims (registered_product_id, customer_user_id, issue_description) VALUES (?, ?, ?)`;
    const [result] = await db.execute(sql, [
      registered_product_id,
      customer_user_id,
      issue_description,
    ]);
    return result.insertId;
  },

  findActiveClaimByProduct: async (registered_product_id) => {
    const sql = `SELECT * FROM warranty_claims WHERE registered_product_id = ? AND claim_status NOT IN ('RESOLVED', 'DENIED')`;
    const [rows] = await db.execute(sql, [registered_product_id]);
    return rows[0];
  },

  getClaimDetails: async (claimId) => {
    try {
      const [rows] = await db.execute(
        `SELECT
        wc.claim_id,
        wc.registered_product_id,
        wc.customer_user_id,
        wc.issue_description,
        wc.claim_status AS claimStatus,
        wc.seller_response_notes AS sellerResponseNotes,
        wc.claimed_at AS claimedAt,
        wc.last_status_update_at AS lastStatusUpdateAt,
        u.name AS customerName,
        u.phone_number AS customerPhoneNumber,
        u.email AS customerEmail,
        crp.product_name AS productName,
        crp.seller_order_id AS sellerOrderId,
        crp.date_of_purchase AS dateOfPurchase,
        crp.warranty_valid_until AS warrantyValidUntil
      FROM warranty_claims wc
      JOIN users u ON wc.customer_user_id = u.user_id
      JOIN customer_registered_products crp ON wc.registered_product_id = crp.registered_product_id
      WHERE wc.claim_id = ?`,
        [claimId]
      );
      return rows[0] || null;
    } catch (error) {
      throw new AppError(
        `Database error fetching claim details: ${error.message}`,
        500
      );
    }
  },

  updateClaimStatus: async (claimId, status, notes) => {
    const sql = `UPDATE warranty_claims SET claim_status = ?, seller_response_notes = ?, last_status_update_at = CURRENT_TIMESTAMP WHERE claim_id = ?`;
    const [result] = await db.execute(sql, [status, notes, claimId]);
    return result.affectedRows;
  },

  getClaimsBySellerId: async (seller_id) => {
    const sql = `
        SELECT 
            wc.claim_id AS claimId, 
            u.name AS customerName, 
            u.phone_number AS customerPhoneNumber,
            crp.product_name AS productName, 
            wc.issue_description AS issueDescription, 
            wc.claim_status AS claimStatus, 
            wc.claimed_at AS claimedAt,
            wc.seller_response_notes AS sellerResponseNotes
        FROM warranty_claims wc 
        JOIN customer_registered_products crp ON wc.registered_product_id = crp.registered_product_id 
        JOIN users u ON wc.customer_user_id = u.user_id 
        WHERE crp.seller_id = ?
        ORDER BY wc.claimed_at DESC`;
    const [rows] = await db.execute(sql, [seller_id]);
    return rows;
  },

  // --- NEWLY ADDED/CORRECTED FUNCTION FOR CUSTOMER CLAIMS LIST ---
  getClaimsByCustomerId: async (customer_user_id) => {
    const sql = `
        SELECT 
            wc.claim_id AS claimId, 
            crp.product_name AS productName, 
            wc.issue_description AS issueDescription, 
            wc.claim_status AS claimStatus, 
            wc.claimed_at AS claimedAt,
            wc.seller_response_notes AS sellerResponseNotes
        FROM warranty_claims wc 
        JOIN customer_registered_products crp ON wc.registered_product_id = crp.registered_product_id 
        WHERE wc.customer_user_id = ?
        ORDER BY wc.claimed_at DESC`;
    const [rows] = await db.execute(sql, [customer_user_id]);
    return rows;
  },

  getPlatformClaimStats: async () => {
    const [rows] = await db.execute(
      `SELECT claim_status, COUNT(*) AS count FROM warranty_claims GROUP BY claim_status`
    );
    return rows;
  },
};

module.exports = claimModel;
