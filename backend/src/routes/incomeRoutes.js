const express = require("express");
const router = express.Router();
const {
  createIncome,
  getIncomes,
  getTotalIncome,
  updateIncome,
  deleteIncome,
} = require("../controllers/incomeController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

// Income routes
router.post("/", createIncome);
router.get("/", getIncomes);
router.get("/total", getTotalIncome);
router.put("/:id", updateIncome);
router.delete("/:id", deleteIncome);

module.exports = router;
