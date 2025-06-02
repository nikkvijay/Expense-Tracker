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

// Connect to database
connectDB();

// ======================
// Middleware Configuration
// ======================

// CORS Configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
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
