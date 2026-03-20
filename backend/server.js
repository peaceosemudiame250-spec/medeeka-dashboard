/**
 * MAIN SERVER FILE (entry point)
 *
 * This file:
 * 1. Loads environment variables from .env
 * 2. Connects to MongoDB
 * 3. Creates Express app
 * 4. Sets up middleware (CORS, JSON parsing)
 * 5. Defines routes
 * 6. Starts the server
 */

// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");

// Import routes
const authRoutes = require("./routes/auth");
const diagnosisRoutes = require("./routes/diagnosis");

// Create Express app
const app = express();

/**
 * MIDDLEWARE
 *
 * Middleware = functions that run on every request
 * They prepare the request before it reaches the route handler
 */

// CORS (Cross-Origin Resource Sharing)
// Allows frontend to communicate with backend
app.use(
  cors({
    origin: function (origin, callback) {
      // For development: allow requests without origin (like from file://)
      // Or from any localhost variant
      const allowedPatterns = [
        /^http:\/\/localhost:\d+/, // localhost:any port
        /^http:\/\/127\.0\.0\.1:\d+/, // 127.0.0.1:any port
        /^http:\/\/0\.0\.0\.0:\d+/, // 0.0.0.0:any port
      ];

      const isAllowed =
        !origin || // No origin (e.g., file://)
        allowedPatterns.some((pattern) => pattern.test(origin));

      if (isAllowed) {
        console.log(
          `✓ CORS allowed for origin: ${origin || "file:// or no-origin"}`,
        );
        callback(null, true);
      } else {
        console.warn(`✗ CORS blocked for origin: ${origin}`);
        // Don't actually reject - just warn for now
        callback(null, true); // Allow anyway for debugging
      }
    },
    credentials: true,
  }),
);

// Parse incoming JSON requests
// Without this, req.body would be undefined
app.use(express.json());

// Parse form data
app.use(express.urlencoded({ extended: true }));

/**
 * CONNECT TO DATABASE
 */
connectDB();

/**
 * ROUTES
 *
 * All auth routes will be prefixed with /api/auth
 * So /patient/register becomes /api/auth/patient/register
 */
app.use("/api/auth", authRoutes);
// Diagnosis routes (run symptom analysis / risk scoring)
app.use("/api/diagnosis", diagnosisRoutes);

/**
 * BASIC HEALTH CHECK ROUTE
 *
 * This helps verify the server is running
 * Navigate to http://localhost:5000/api/health to test
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "✅ Server is running",
  });
});

/**
 * 404 ERROR HANDLER
 *
 * If a route doesn't exist, return 404
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/**
 * GLOBAL ERROR HANDLER
 *
 * Catches any errors that occur in the application
 */
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

/**
 * START SERVER
 */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🚀 MEDEEKA BACKEND SERVER RUNNING    ║
╠═══════════════════════════════════════╣
║ Server: http://localhost:${PORT}          ║
║ Environment: ${process.env.NODE_ENV || "development"}         ║
╚═══════════════════════════════════════╝
  `);
});

/**
 * GRACEFUL SHUTDOWN
 *
 * When server stops, close database connection properly
 */
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
