// src/models/logModel.js: Handles all direct database operations for the `logs` table.
const db = require("../config/db");

const logModel = {
  createLog: async (
    userId,
    actionType,
    entityType,
    entityId,
    details,
    ipAddress
  ) => {
    const sql = `INSERT INTO logs (user_id, action_type, entity_type, entity_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)`;
    await db.execute(sql, [
      userId,
      actionType,
      entityType,
      entityId,
      JSON.stringify(details),
      ipAddress,
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
