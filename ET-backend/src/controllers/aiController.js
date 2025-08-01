const aiService = require("../services/aiService");
const Expense = require("../models/Expenses");
const Income = require("../models/Income");
const ErrorResponse = require("../utils/errorHandler");

// Auto-categorize expense description
exports.categorizeExpense = async (req, res, next) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return next(new ErrorResponse("Description is required", 400));
    }

    const result = await aiService.categorizeExpense(description);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Categorize expense error:", error);
    next(new ErrorResponse("Failed to categorize expense", 500));
  }
};

// Get AI-powered spending analysis
exports.analyzeSpending = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(new ErrorResponse("User not authenticated", 401));
    }

    // Get user's expenses and income
    const [expenses, incomes] = await Promise.all([
      Expense.find({ user: req.user.id }).sort({ createdAt: -1 }),
      Income.find({ user: req.user.id })
    ]);

    // Calculate total monthly income
    const currentDate = new Date();
    const monthlyIncome = incomes.reduce((total, income) => {
      if (income.isRecurring && income.frequency === 'monthly') {
        return total + income.amount;
      } else if (income.isRecurring && income.frequency === 'yearly') {
        return total + (income.amount / 12);
      } else if (income.isRecurring && income.frequency === 'weekly') {
        return total + (income.amount * 4.33); // Average weeks per month
      }
      return total + income.amount;
    }, 0);

    const analysis = await aiService.analyzeSpending(expenses, monthlyIncome);
    
    res.status(200).json({
      success: true,
      data: {
        ...analysis,
        metadata: {
          totalExpenses: expenses.length,
          totalIncome: monthlyIncome,
          totalSpent: expenses.reduce((sum, exp) => sum + exp.amount, 0),
          analysisDate: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error("Analyze spending error:", error);
    next(new ErrorResponse("Failed to analyze spending", 500));
  }
};

// Get AI budget recommendations
exports.getBudgetRecommendations = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(new ErrorResponse("User not authenticated", 401));
    }

    // Get user's expenses and income
    const [expenses, incomes] = await Promise.all([
      Expense.find({ user: req.user.id }).sort({ createdAt: -1 }),
      Income.find({ user: req.user.id })
    ]);

    // Calculate monthly income
    const monthlyIncome = incomes.reduce((total, income) => {
      if (income.isRecurring && income.frequency === 'monthly') {
        return total + income.amount;
      } else if (income.isRecurring && income.frequency === 'yearly') {
        return total + (income.amount / 12);
      } else if (income.isRecurring && income.frequency === 'weekly') {
        return total + (income.amount * 4.33);
      }
      return total + income.amount;
    }, 0);

    const recommendations = await aiService.generateBudgetRecommendations(expenses, monthlyIncome);
    
    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error("Budget recommendations error:", error);
    next(new ErrorResponse("Failed to generate budget recommendations", 500));
  }
};

// Detect spending anomalies
exports.detectAnomalies = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(new ErrorResponse("User not authenticated", 401));
    }

    const expenses = await Expense.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); // Analyze last 50 expenses

    const anomalies = await aiService.detectAnomalies(expenses);
    
    res.status(200).json({
      success: true,
      data: anomalies
    });
  } catch (error) {
    console.error("Detect anomalies error:", error);
    next(new ErrorResponse("Failed to detect anomalies", 500));
  }
};

// Get AI financial insights for dashboard
exports.getFinancialInsights = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(new ErrorResponse("User not authenticated", 401));
    }

    // Get recent data
    const [recentExpenses, incomes, anomalies] = await Promise.all([
      Expense.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20),
      Income.find({ user: req.user.id }),
      Expense.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(10)
    ]);

    // Calculate monthly income
    const monthlyIncome = incomes.reduce((total, income) => {
      if (income.isRecurring && income.frequency === 'monthly') {
        return total + income.amount;
      } else if (income.isRecurring && income.frequency === 'yearly') {
        return total + (income.amount / 12);
      } else if (income.isRecurring && income.frequency === 'weekly') {
        return total + (income.amount * 4.33);
      }
      return total + income.amount;
    }, 0);

    // Get all insights in parallel
    const [analysis, budgetRecs, anomalyData] = await Promise.all([
      aiService.analyzeSpending(recentExpenses, monthlyIncome),
      aiService.generateBudgetRecommendations(recentExpenses, monthlyIncome),
      aiService.detectAnomalies(anomalies)
    ]);

    res.status(200).json({
      success: true,
      data: {
        analysis,
        budgetRecommendations: budgetRecs,
        anomalies: anomalyData,
        summary: {
          totalExpenses: recentExpenses.length,
          monthlyIncome,
          totalSpent: recentExpenses.reduce((sum, exp) => sum + exp.amount, 0),
          lastUpdated: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error("Financial insights error:", error);
    next(new ErrorResponse("Failed to get financial insights", 500));
  }
};