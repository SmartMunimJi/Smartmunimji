// src/models/userModel.js: Handles all direct database operations for the `users` table.
const db = require("../config/db");

const userModel = {
  createUser: async (
    name,
    email,
    password_hash,
    phone_number,
    address,
    role_id
  ) => {
    const sql =
      "INSERT INTO users (name, email, password_hash, phone_number, address, role_id) VALUES (?, ?, ?, ?, ?, ?)";
    const [result] = await db.execute(sql, [
      name,
      email,
      password_hash,
      phone_number,
      address,
      role_id,
    ]);
    return result.insertId;
  },

  findUserByEmail: async (email) => {
    // Joins with roles to get role_name and with sellers to get seller_id if applicable
    const sql = `
        SELECT 
            u.user_id, u.email, u.password_hash, u.phone_number, u.name, u.address, 
            u.is_active, u.created_at, u.updated_at,
            r.role_name,
            s.seller_id
        FROM users u 
        JOIN roles r ON u.role_id = r.role_id 
        LEFT JOIN sellers s ON u.user_id = s.user_id 
        WHERE u.email = ?`;
    const [rows] = await db.execute(sql, [email]);
    return rows[0];
  },

  findUserById: async (userId) => {
    const sql = `
        SELECT 
            u.user_id, u.email, u.password_hash, u.phone_number, u.name, u.address, 
            u.is_active, u.created_at, u.updated_at,
            r.role_name,
            s.seller_id
        FROM users u 
        JOIN roles r ON u.role_id = r.role_id 
        LEFT JOIN sellers s ON u.user_id = s.user_id 
        WHERE u.user_id = ?`;
    const [rows] = await db.execute(sql, [userId]);
    return rows[0];
  },

  updateUserProfile: async (userId, data) => {
    const fields = [];
    const values = [];
    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }
    if (data.address !== undefined) {
      fields.push("address = ?");
      values.push(data.address);
    }
    if (data.phone_number !== undefined) {
      fields.push("phone_number = ?");
      values.push(data.phone_number);
    }
    if (data.email !== undefined) {
      fields.push("email = ?");
      values.push(data.email);
    }

    if (fields.length === 0) return 0; // No fields to update

    const sql = `UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`;
    values.push(userId);
    const [result] = await db.execute(sql, values);
    return result.affectedRows;
  },

  updateUserStatus: async (userId, isActive) => {
    const sql = `UPDATE users SET is_active = ? WHERE user_id = ?`;
    const [result] = await db.execute(sql, [isActive ? 1 : 0, userId]);
    return result.affectedRows;
  },

  getAllUsers: async () => {
    const sql = `
        SELECT 
            u.user_id AS userId, u.name, u.email, r.role_name AS role, u.is_active AS isActive 
        FROM users u 
        JOIN roles r ON u.role_id = r.role_id 
        ORDER BY u.created_at DESC`;
    const [rows] = await db.execute(sql);
    return rows;
  },
};

module.exports = userModel;
