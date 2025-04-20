// server/api/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../src/config/db");
const authRoutes = require("../src/routes/authRoutes");
const expenseRoutes = require("../src/routes/expenseRoutes");

dotenv.config();
connectDB();

const app = express();

// Update CORS to accept Vercel's deployment URL later
app.use(cors({ 
  origin: process.env.FRONTEND_URL || "*",
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

// Add a health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Server Error";
  res.status(statusCode).json({
    success: false,
    message,
  });
});

module.exports = app;
