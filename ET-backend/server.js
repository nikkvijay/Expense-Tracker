// Import required packages
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import local modules
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const expenseRoutes = require("./src/routes/expenseRoutes");
const incomeRoutes = require("./src/routes/incomeRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const chatbotRoutes = require("./src/routes/chatbotRoutes");
const speechRoutes = require("./src/routes/speechRoutes");

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
    origin: [process.env.FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

// Body Parser
app.use(express.json());

// ======================
// Route Configuration
// ======================

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Expense Tracker API is running!",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/speech", speechRoutes);

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
