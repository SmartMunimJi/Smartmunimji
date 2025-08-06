// src/app.js: The main entry point for the Smart Munim Ji backend Express application.
const express = require("express");
const cors = require("cors");
const config = require("./config/config"); // Load configuration
const logger = require("./utils/logger"); // Load logger utility
const errorMiddleware = require("./middleware/errorMiddleware"); // Load global error handler
const AppError = require("./utils/AppError"); // Custom error class

// Initialize database connection pool (and test connection on startup)
require("./config/db");

const app = express();

// --- Global Middleware ---
app.use(cors()); // Enable CORS for all origins (for development)
app.use(express.json()); // Body parser for JSON request bodies
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded request bodies

// --- Root Endpoint ---
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Smart Munim Ji! Your digital warranty companion.",
    info: "Store your invoices, track warranties, and claim support effortlessly.",
    navigation:
      "Please navigate to /sm for API endpoints or log in to access features.",
  });
});

// --- API Routes ---
// Import and use all route modules. Logic is directly within these files.
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const setupRoutes = require("./routes/setupRoutes"); // <--- NEW: Import setup routes

app.use("/sm/auth", authRoutes);
logger.info("Auth routes registered on /sm/auth");

app.use("/sm/customer", customerRoutes);
logger.info("Customer routes registered on /sm/customer");

app.use("/sm/seller", sellerRoutes);
logger.info("Seller routes registered on /sm/seller");

app.use("/sm/admin", adminRoutes);
logger.info("Admin routes registered on /sm/admin");

app.use("/sm/setup", setupRoutes); // <--- NEW: Use setup routes
logger.info("Setup routes registered on /sm/setup");

// --- Error Handling ---
// Catch-all for any routes not handled by the above definitions (404 Not Found)
app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware (must be the very last middleware to be used)
app.use(errorMiddleware);

// --- Start the Server ---
const PORT = config.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info("Smart Munim Ji Backend is ready and operational!");
});
