const express = require("express");
const router = express.Router();
const {
  processMessage,
  getChatHistory,
  clearChatHistory,
  getChatbotCapabilities
} = require("../controllers/chatbotController");
const authMiddleware = require("../middleware/authMiddleware");

// All chatbot routes require authentication
router.use(authMiddleware);

// Process chatbot message
router.post("/message", processMessage);

// Get chat history
router.get("/history", getChatHistory);

// Clear chat history
router.delete("/history", clearChatHistory);

// Get chatbot capabilities
router.get("/capabilities", getChatbotCapabilities);

module.exports = router;