const chatbotService = require("../services/chatbotService");
const Expense = require("../models/Expenses");
const Income = require("../models/Income");
const ErrorResponse = require("../utils/errorHandler");

// Store chat sessions in memory (in production, use Redis or database)
const chatSessions = new Map();

// Process chatbot message
exports.processMessage = async (req, res, next) => {
  try {
    const { message, currency } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return next(new ErrorResponse("Message is required", 400));
    }

    // Get user's expenses and incomes for context
    const [userExpenses, userIncomes] = await Promise.all([
      Expense.find({ user: userId }).sort({ createdAt: -1 }),
      Income.find({ user: userId })
    ]);

    // Process the message with chatbot service
    const result = await chatbotService.processMessage(
      message.trim(),
      userId,
      userExpenses,
      userIncomes,
      currency
    );

    // Execute the action if one was determined
    let actionResult = null;
    if (result.action) {
      actionResult = await executeAction(result.action, req, res);
    }

    // Store conversation in session
    const sessionId = `${userId}_${Date.now()}`;
    if (!chatSessions.has(userId)) {
      chatSessions.set(userId, []);
    }
    
    const userSession = chatSessions.get(userId);
    userSession.push({
      id: sessionId,
      timestamp: new Date(),
      userMessage: message,
      botResponse: result.response,
      action: result.action,
      actionResult: actionResult,
      success: result.success
    });

    // Keep only last 50 messages per user
    if (userSession.length > 50) {
      userSession.splice(0, userSession.length - 50);
    }

    res.status(200).json({
      success: true,
      data: {
        response: result.response,
        action: result.action,
        actionResult: actionResult,
        sessionId: sessionId,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error("Chatbot message processing error:", error);
    next(new ErrorResponse("Failed to process message", 500));
  }
};

// Execute determined actions
async function executeAction(action, req, res) {
  try {
    switch (action.type) {
      case 'ADD_EXPENSE':
        return await addExpenseAction(action.data, req);
      
      case 'ADD_INCOME':
        return await addIncomeAction(action.data, req);
      
      case 'DELETE_EXPENSE':
        return await deleteExpenseAction(action.data, req);
      
      case 'VIEW_EXPENSES':
      case 'VIEW_ANALYTICS':
      case 'BUDGET_HELP':
        // These are informational, no action needed
        return { success: true, message: "Information displayed" };
      
      default:
        return null;
    }
  } catch (error) {
    console.error("Action execution error:", error);
    return { success: false, error: error.message };
  }
}

// Add expense action
async function addExpenseAction(expenseData, req) {
  try {
    const expense = await Expense.create({
      ...expenseData,
      user: req.user.id
    });

    return {
      success: true,
      data: expense,
      message: "Expense added successfully"
    };
  } catch (error) {
    throw new Error("Failed to add expense: " + error.message);
  }
}

// Add income action
async function addIncomeAction(incomeData, req) {
  try {
    const income = await Income.create({
      ...incomeData,
      user: req.user.id
    });

    return {
      success: true,
      data: income,
      message: "Income added successfully"
    };
  } catch (error) {
    throw new Error("Failed to add income: " + error.message);
  }
}

// Delete expense action
async function deleteExpenseAction(deleteData, req) {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: deleteData.id,
      user: req.user.id
    });

    if (!expense) {
      throw new Error("Expense not found");
    }

    return {
      success: true,
      data: expense,
      message: "Expense deleted successfully"
    };
  } catch (error) {
    throw new Error("Failed to delete expense: " + error.message);
  }
}

// Get chat history
exports.getChatHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    
    const userSession = chatSessions.get(userId) || [];
    const history = userSession
      .slice(-limit)
      .map(chat => ({
        id: chat.id,
        timestamp: chat.timestamp,
        userMessage: chat.userMessage,
        botResponse: chat.botResponse,
        success: chat.success
      }));

    res.status(200).json({
      success: true,
      data: {
        history: history,
        totalMessages: userSession.length
      }
    });

  } catch (error) {
    console.error("Get chat history error:", error);
    next(new ErrorResponse("Failed to get chat history", 500));
  }
};

// Clear chat history
exports.clearChatHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    chatSessions.delete(userId);

    res.status(200).json({
      success: true,
      message: "Chat history cleared"
    });

  } catch (error) {
    console.error("Clear chat history error:", error);
    next(new ErrorResponse("Failed to clear chat history", 500));
  }
};

// Get chatbot capabilities
exports.getChatbotCapabilities = async (req, res, next) => {
  try {
    const capabilities = {
      intents: [
        {
          name: "Add Expense",
          description: "Add a new expense entry",
          examples: [
            "I spent $25 on lunch",
            "Add $50 gas expense",
            "Bought coffee for $5"
          ]
        },
        {
          name: "Add Income",
          description: "Record income entry",
          examples: [
            "I got paid $3000",
            "Add salary income of $5000",
            "Received $500 freelance payment"
          ]
        },
        {
          name: "View Expenses",
          description: "Display expense information",
          examples: [
            "Show my expenses",
            "What did I spend this month?",
            "List my recent purchases"
          ]
        },
        {
          name: "Analytics",
          description: "Get spending insights and analysis",
          examples: [
            "Analyze my spending",
            "Show spending breakdown",
            "Give me financial insights"
          ]
        },
        {
          name: "Budget Help",
          description: "Get budget recommendations",
          examples: [
            "Help me budget",
            "Budget recommendations",
            "How should I allocate my money?"
          ]
        },
        {
          name: "Delete Expense",
          description: "Remove expense entries",
          examples: [
            "Delete my last expense",
            "Remove the coffee expense",
            "Cancel that purchase"
          ]
        }
      ],
      supportedCategories: [
        "food", "transport", "entertainment", "bills", 
        "shopping", "health", "education", "other"
      ],
      paymentMethods: ["card", "cash", "account", "digital"]
    };

    res.status(200).json({
      success: true,
      data: capabilities
    });

  } catch (error) {
    console.error("Get capabilities error:", error);
    next(new ErrorResponse("Failed to get capabilities", 500));
  }
};