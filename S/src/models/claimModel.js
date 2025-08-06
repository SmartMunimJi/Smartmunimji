// src/models/claimModel.js: Handles all direct database operations for the `warranty_claims` table.
const db = require("../config/db");

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

  getClaimDetails: async (claim_id) => {
    const sql = `
        SELECT 
            wc.claim_id AS claimId, 
            wc.registered_product_id AS registeredProductId, 
            crp.product_name AS productName, 
            s.shop_name AS shopName, 
            wc.issue_description AS issueDescription, 
            wc.claim_status AS claimStatus, 
            wc.seller_response_notes AS sellerResponseNotes, 
            wc.claimed_at AS claimedAt, 
            wc.last_status_update_at AS lastStatusUpdateAt
        FROM warranty_claims wc 
        JOIN customer_registered_products crp ON wc.registered_product_id = crp.registered_product_id 
        JOIN sellers s ON crp.seller_id = s.seller_id 
        WHERE wc.claim_id = ?`;
    const [rows] = await db.execute(sql, [claim_id]);
    return rows[0];
  },

  updateClaimStatus: async (claim_id, status, notes) => {
    const sql = `UPDATE warranty_claims SET claim_status = ?, seller_response_notes = ?, last_status_update_at = CURRENT_TIMESTAMP WHERE claim_id = ?`;
    const [result] = await db.execute(sql, [status, notes, claim_id]);
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
            wc.claimed_at AS claimedAt
        FROM warranty_claims wc 
        JOIN customer_registered_products crp ON wc.registered_product_id = crp.registered_product_id 
        JOIN users u ON wc.customer_user_id = u.user_id 
        WHERE crp.seller_id = ?
        ORDER BY wc.claimed_at DESC`;
    const [rows] = await db.execute(sql, [seller_id]);
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
