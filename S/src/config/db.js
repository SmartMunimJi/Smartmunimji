// src/config/db.js: Manages the connection pool to the MySQL database.
const mysql = require("mysql2/promise");
const config = require("./config"); // Referencing config.js
const logger = require("../utils/logger");

const pool = mysql.createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool
  .getConnection()
  .then((conn) => {
    logger.info("MySQL Connection Pool Created Successfully.");
    conn.release();
  })
  .catch((err) => {
    logger.error("!!! CRITICAL: Failed to connect to MySQL Database !!!", err);
    process.exit(1); // Exit process if DB connection fails
  });

module.exports = pool;
