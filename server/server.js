const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const expenseRoutes = require("./src/routes/expenseRoutes");

const PORT = process.env.PORT || 5000;

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Server Error";
  res.status(statusCode).json({
    success: false,
    message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
