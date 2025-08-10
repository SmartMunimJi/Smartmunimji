// src/config/config.js: Centralized configuration for the application.
module.exports = {
  PORT: 3000,
  DB_HOST: "localhost",
  DB_USER: "root",
  DB_PASSWORD: "manager",
  DB_NAME: "smartmunimji_db",
  JWT_SECRET:
    "a_very_secure_and_long_secret_key_for_jwt_signing_smart_munim_ji_2025",
  JWT_EXPIRATION: "5h", // Token expiration time
};
