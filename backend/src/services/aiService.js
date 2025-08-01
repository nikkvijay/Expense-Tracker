const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiAIService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not found in environment variables");
      this.genAI = null;
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  // Auto-categorize expense based on description
  async categorizeExpense(description) {
    if (!this.genAI) {
      return { category: "other", confidence: 0 };
    }

    try {
      const categories = [
        "food", "transport", "entertainment", "bills", 
        "shopping", "health", "education", "other"
      ];

      const prompt = `
        Analyze this expense description and categorize it into one of these categories:
        - food: Food, dining, groceries, restaurants, coffee
        - transport: Gas, uber, taxi, bus, train, car maintenance
        - entertainment: Movies, games, concerts, streaming services
        - bills: Utilities, rent, phone, insurance, subscriptions
        - shopping: Clothes, electronics, home goods, personal items
        - health: Medical, pharmacy, gym, wellness
        - education: Books, courses, school supplies
        - other: Everything else

        Expense description: "${description}"

        Respond with ONLY the category name (one word, lowercase).
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const category = response.text().trim().toLowerCase();

      // Validate the category
      if (categories.includes(category)) {
        return { category, confidence: 0.9 };
      }

      return { category: "other", confidence: 0.5 };
    } catch (error) {
      console.error("AI categorization error:", error);
      return { category: "other", confidence: 0 };
    }
  }

  // Generate spending insights and recommendations
  async analyzeSpending(expenses, income = 0) {
    if (!this.genAI || !expenses || expenses.length === 0) {
      return {
        insights: ["Add some expenses to get AI-powered insights!"],
        recommendations: ["Start tracking your expenses regularly."],
        financialHealth: { score: 50, status: "neutral" }
      };
    }

    try {
      const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const categoryTotals = this.getCategoryTotals(expenses);
      const monthlyData = this.getMonthlyData(expenses);

      const prompt = `
        As a financial advisor AI, analyze this spending data and provide insights:

        Total Income: $${income}
        Total Expenses: $${totalSpent}
        Number of Transactions: ${expenses.length}

        Spending by Category:
        ${Object.entries(categoryTotals).map(([cat, amount]) => `- ${cat}: $${amount}`).join('\n')}

        Recent Expenses (last 5):
        ${expenses.slice(0, 5).map(exp => `- ${exp.description || 'No description'}: $${exp.amount} (${exp.category})`).join('\n')}

        Please provide:
        1. 3-4 key spending insights
        2. 3-4 actionable recommendations
        3. A financial health score (0-100) with status (poor/fair/good/excellent)

        Format your response as JSON:
        {
          "insights": ["insight1", "insight2", "insight3"],
          "recommendations": ["rec1", "rec2", "rec3"],
          "financialHealth": {
            "score": 75,
            "status": "good",
            "summary": "Brief explanation"
          }
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Try to parse JSON, fallback to structured response
      try {
        const parsed = JSON.parse(response);
        return parsed;
      } catch (parseError) {
        // If JSON parsing fails, create structured response from text
        return this.parseAIResponse(response, totalSpent, income);
      }

    } catch (error) {
      console.error("AI analysis error:", error);
      return {
        insights: [
          `You've spent $${expenses.reduce((sum, exp) => sum + exp.amount, 0)} across ${expenses.length} transactions`,
          "Your spending patterns show room for optimization"
        ],
        recommendations: [
          "Review your largest expense categories for potential savings",
          "Set up a monthly budget to track spending goals"
        ],
        financialHealth: { score: 60, status: "fair", summary: "Needs attention" }
      };
    }
  }

  // Generate smart budget recommendations
  async generateBudgetRecommendations(expenses, income) {
    if (!this.genAI) {
      return {
        totalBudget: income * 0.8,
        categoryBudgets: {
          food: income * 0.15,
          transport: income * 0.15,
          entertainment: income * 0.05,
          bills: income * 0.25,
          shopping: income * 0.10,
          other: income * 0.10
        }
      };
    }

    try {
      const categoryTotals = this.getCategoryTotals(expenses);
      
      const prompt = `
        Create a smart monthly budget based on this data:
        
        Monthly Income: $${income}
        Current Spending Pattern:
        ${Object.entries(categoryTotals).map(([cat, amount]) => `- ${cat}: $${amount}`).join('\n')}

        Follow the 50/30/20 rule (needs/wants/savings) and provide:
        - Recommended budget for each category
        - Total recommended monthly spending
        - Savings target
        
        Format as JSON:
        {
          "totalBudget": 2000,
          "savingsTarget": 400,
          "categoryBudgets": {
            "food": 300,
            "transport": 200,
            "entertainment": 100,
            "bills": 500,
            "shopping": 150,
            "health": 100,
            "education": 50,
            "other": 100
          },
          "explanation": "Brief explanation of recommendations"
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        // Fallback budget calculation
        return {
          totalBudget: income * 0.8,
          savingsTarget: income * 0.2,
          categoryBudgets: {
            food: income * 0.15,
            transport: income * 0.15,
            entertainment: income * 0.05,
            bills: income * 0.25,
            shopping: income * 0.10,
            health: income * 0.05,
            education: income * 0.03,
            other: income * 0.07
          },
          explanation: "Budget based on recommended financial guidelines"
        };
      }

    } catch (error) {
      console.error("Budget recommendation error:", error);
      return {
        totalBudget: income * 0.8,
        savingsTarget: income * 0.2,
        categoryBudgets: {
          food: income * 0.15,
          transport: income * 0.15,
          entertainment: income * 0.05,
          bills: income * 0.25,
          shopping: income * 0.10,
          health: income * 0.05,
          education: income * 0.03,
          other: income * 0.07
        },
        explanation: "Budget based on standard financial recommendations"
      };
    }
  }

  // Detect spending anomalies
  async detectAnomalies(expenses) {
    if (!this.genAI || expenses.length < 10) {
      return { anomalies: [], alerts: [] };
    }

    try {
      const recentExpenses = expenses.slice(0, 10);
      const amounts = recentExpenses.map(exp => exp.amount);
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      
      const prompt = `
        Analyze these recent expenses for anomalies:
        
        Recent Expenses:
        ${recentExpenses.map(exp => 
          `- $${exp.amount} on ${exp.description || 'No description'} (${exp.category})`
        ).join('\n')}
        
        Average expense: $${avgAmount.toFixed(2)}
        
        Identify:
        1. Unusually large expenses (3x+ average)
        2. Duplicate or suspicious charges
        3. Spending pattern changes
        
        Format as JSON:
        {
          "anomalies": ["Unusual $500 entertainment expense", "Duplicate charge detected"],
          "alerts": ["Review large entertainment expense", "Check duplicate charges"]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        // Simple anomaly detection fallback
        const anomalies = [];
        const alerts = [];
        
        recentExpenses.forEach(exp => {
          if (exp.amount > avgAmount * 3) {
            anomalies.push(`Large ${exp.category} expense: $${exp.amount}`);
            alerts.push(`Review large ${exp.category} expense of $${exp.amount}`);
          }
        });
        
        return { anomalies, alerts };
      }

    } catch (error) {
      console.error("Anomaly detection error:", error);
      return { anomalies: [], alerts: [] };
    }
  }

  // Helper methods
  getCategoryTotals(expenses) {
    return expenses.reduce((totals, expense) => {
      const category = expense.category || 'other';
      totals[category] = (totals[category] || 0) + expense.amount;
      return totals;
    }, {});
  }

  getMonthlyData(expenses) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && 
             expenseDate.getFullYear() === currentYear;
    });
  }

  parseAIResponse(text, totalSpent, income) {
    // Fallback parser for non-JSON responses
    const lines = text.split('\n').filter(line => line.trim());
    
    return {
      insights: [
        `Total spending: $${totalSpent}`,
        `Monthly budget utilization: ${income > 0 ? Math.round((totalSpent/income)*100) : 'N/A'}%`,
        "AI analysis indicates room for optimization"
      ],
      recommendations: [
        "Track expenses more consistently",
        "Set category-specific budgets",
        "Review and reduce unnecessary spending"
      ],
      financialHealth: {
        score: income > totalSpent ? 75 : 45,
        status: income > totalSpent ? "good" : "needs attention",
        summary: "Based on income vs expenses ratio"
      }
    };
  }
}

module.exports = new GeminiAIService();