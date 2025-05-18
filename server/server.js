// Import required packages
const express = require("express");
const cors = require("cors");

// Import local modules
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const expenseRoutes = require("./src/routes/expenseRoutes");

// Environment variables
const PORT = process.env.PORT || 5000;

// Initialize express app
const app = express();

// ======================
// Database Configuration
// ======================
connectDB();

// ======================
// Middleware Configuration
// ======================

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173", // Vite default port
  "http://localhost:3000", // Common React port
  process.env.FRONTEND_URL, // Production URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parser
app.use(express.json());

// ======================
// Route Configuration
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

// Basic root route for testing
app.get("/", (req, res) => {
  res.send("Hello World");
});

// ======================
// Error Handling
// ======================
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Server Error";
  res.status(statusCode).json({
    success: false,
    message,
  });
});

// ======================
// Server Initialization
// ======================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
