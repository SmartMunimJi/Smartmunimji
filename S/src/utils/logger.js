// src/utils/logger.js: A simple console-based logging utility.
const logger = {
  info: (message, ...args) =>
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, ...args),
  warn: (message, ...args) =>
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...args),
  error: (message, err) =>
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, err || ""),
  debug: (message, ...args) =>
    console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, ...args),
};
module.exports = logger;
