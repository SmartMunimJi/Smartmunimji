// src/models/logModel.js: Handles all direct database operations for the `logs` table.
const db = require("../config/db");

const logModel = {
  // Now accepts a single logData object
  createLog: async (logData) => {
    const { userId, actionType, entityType, entityId, details, ipAddress } =
      logData;
    const sql = `INSERT INTO logs (user_id, action_type, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)`;
    await db.execute(sql, [
      userId || null, // Ensure userId is null if not provided
      actionType,
      entityType || null, // Ensure entityType is null if not provided
      entityId || null, // Ensure entityId is null if not provided
      details ? JSON.stringify(details) : null, // Stringify details or set to null
      ipAddress || null, // Ensure ipAddress is null if not provided
    ]);
  },

  getLogs: async () => {
    const sql = `
        SELECT
            l.log_id AS logId, l.timestamp, l.action_type AS actionType,
            l.entity_type AS entityType, l.entity_id AS entityId, l.details,
            l.ip_address AS ipAddress, u.name AS userName
        FROM logs l
        LEFT JOIN users u ON l.user_id = u.user_id
        ORDER BY l.timestamp DESC`;
    const [rows] = await db.execute(sql);
    return rows;
  },
};

module.exports = logModel;
