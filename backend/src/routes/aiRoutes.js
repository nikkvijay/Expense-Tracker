const express = require("express");
const router = express.Router();
const {
  categorizeExpense,
  analyzeSpending,
  getBudgetRecommendations,
  detectAnomalies,
  getFinancialInsights
} = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

// All AI routes require authentication
router.use(authMiddleware);

// AI-powered expense categorization
router.post("/categorize", categorizeExpense);

// Spending analysis and insights
router.get("/analyze", analyzeSpending);

// Budget recommendations
router.get("/budget-recommendations", getBudgetRecommendations);

// Anomaly detection
router.get("/anomalies", detectAnomalies);

// Complete financial insights (for dashboard)
router.get("/insights", getFinancialInsights);

module.exports = router;