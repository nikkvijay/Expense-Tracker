const { GoogleGenerativeAI } = require("@google/generative-ai");
const aiService = require("./aiService");

class ChatbotService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not found in environment variables");
      this.genAI = null;
      return;
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Format currency based on user's settings
  formatCurrency(amount, currency = null) {
    if (!currency) {
      return `$${amount.toFixed(2)}`;
    }
    
    const formattedAmount = amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return currency.position === 'before' 
      ? `${currency.symbol}${formattedAmount}`
      : `${formattedAmount} ${currency.symbol}`;
  }

  // Process user message and determine intent
  async processMessage(message, userId, userExpenses = [], userIncomes = [], currency = null) {
    if (!this.genAI) {
      return {
        response: "I'm sorry, the AI service is not available right now.",
        action: null,
        success: false
      };
    }

    try {
      // Analyze user intent using AI
      const intent = await this.analyzeIntent(message);
      
      // Process the intent and generate response
      const result = await this.executeIntent(intent, message, userId, userExpenses, userIncomes, currency);
      
      return result;
    } catch (error) {
      console.error("Chatbot processing error:", error);
      return {
        response: "I'm sorry, I couldn't understand that. Could you please rephrase?",
        action: null,
        success: false
      };
    }
  }

  // Analyze user intent using Gemini AI with enhanced intelligence
  async analyzeIntent(message) {
    const prompt = `
      You are an advanced AI financial assistant. Analyze this user message and determine the intent with high intelligence.
      
      User message: "${message}"
      
      Available intents:
      1. ADD_EXPENSE - Adding a new expense (e.g., "I spent $20 on lunch", "Add expense for coffee $5", "bought groceries for 50 dollars")
      2. ADD_INCOME - Adding income (e.g., "I got paid $3000", "Add salary income", "received freelance payment")
      3. VIEW_EXPENSES - Viewing expenses (e.g., "Show my expenses", "What did I spend this month", "list my transactions")
      4. VIEW_ANALYTICS - Getting insights (e.g., "Analyze my spending", "Show spending breakdown", "how am I doing financially")
      5. BUDGET_HELP - Budget related (e.g., "Help me set a budget", "Budget recommendations", "how much should I spend")
      6. DELETE_EXPENSE - Remove expense (e.g., "Delete my last expense", "Remove coffee expense", "cancel that transaction")
      7. GENERAL_CHAT - General conversation, greetings, or unclear intent
      
      SMART EXTRACTION RULES:
      
      For expenses - be intelligent about:
      - Amount: Extract from various formats ($20, 20 dollars, twenty bucks, 20.50, etc.)
      - Category detection based on context:
        * Food: restaurants, groceries, lunch, dinner, coffee, pizza, McDonald's, Starbucks, etc.
        * Transport: gas, uber, taxi, bus, train, parking, car repair, etc.
        * Entertainment: movies, games, Netflix, concerts, streaming, books, etc.
        * Bills: utilities, rent, phone, insurance, internet, electricity, etc.
        * Shopping: clothes, Amazon, mall, shoes, electronics, etc.
        * Health: doctor, pharmacy, gym, medicine, hospital, etc.
        * Education: books, courses, school, tuition, etc.
        * Other: anything else
      - Description: Extract main item/service mentioned
      - Payment method: card (default), cash, account, digital wallet, etc.
      - Date: today (default), yesterday, last week, specific dates
      
      For income - detect:
      - Amount: same intelligent extraction as expenses
      - Source types:
        * Salary: regular job, paycheck, monthly salary, etc.
        * Freelance: project payment, contract work, side job, etc.
        * Investment: dividends, returns, stocks, crypto, etc.
        * Business: sales, revenue, business income, etc.
        * Other: gifts, refunds, misc income
      - Recurring patterns: monthly salary, weekly pay, annual bonus, etc.
      
      MISSING INFORMATION DETECTION:
      - If amount is missing but intent is clear, set missingInfo: ["amount"]
      - If category unclear for expense, set missingInfo: ["category"]
      - If income source unclear, set missingInfo: ["source"]
      
      CONFIDENCE SCORING:
      - 0.9+: Clear intent with all required info
      - 0.7-0.8: Clear intent but missing some info
      - 0.5-0.6: Probable intent but ambiguous
      - Below 0.5: Unclear intent
      
      Respond in JSON format:
      {
        "intent": "ADD_EXPENSE",
        "confidence": 0.9,
        "missingInfo": [],
        "data": {
          "amount": 20,
          "category": "food",
          "description": "lunch at McDonald's",
          "paymentMethod": "card",
          "date": null
        },
        "contextualInfo": {
          "brandMentioned": "McDonald's",
          "suggestedQuestions": [],
          "alternatives": []
        }
      }
      
      If information is missing, include helpful questions:
      {
        "intent": "ADD_EXPENSE",
        "confidence": 0.7,
        "missingInfo": ["amount"],
        "data": {
          "amount": null,
          "category": "food",
          "description": "lunch",
          "paymentMethod": "card",
          "date": null
        },
        "contextualInfo": {
          "suggestedQuestions": ["How much did you spend on lunch?"],
          "alternatives": ["Was it around $10-15 for a typical lunch?"]
        }
      }
    `;

    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    try {
      return JSON.parse(response);
    } catch (parseError) {
      // Fallback to basic parsing if JSON fails
      return this.basicIntentParsing(message);
    }
  }

  // Execute the determined intent with smart handling
  async executeIntent(intent, originalMessage, userId, userExpenses, userIncomes, currency = null) {
    const { intent: intentType, data, confidence, missingInfo, contextualInfo } = intent;

    // Handle low confidence with helpful suggestions
    if (confidence < 0.5) {
      return {
        response: "I'm not sure what you want to do. Could you be more specific? For example:\n• \"I spent $25 on lunch\"\n• \"Show my expenses\"\n• \"Analyze my spending\"",
        action: null,
        success: false,
        suggestions: [
          "Add an expense",
          "View expenses",
          "Get spending analysis",
          "Budget help"
        ]
      };
    }

    // Handle missing information with smart questions
    if (missingInfo && missingInfo.length > 0) {
      return this.handleMissingInformation(intent, originalMessage, currency);
    }

    switch (intentType) {
      case 'ADD_EXPENSE':
        return this.handleAddExpense(data, originalMessage, currency, contextualInfo);
      
      case 'ADD_INCOME':
        return this.handleAddIncome(data, originalMessage, currency, contextualInfo);
      
      case 'VIEW_EXPENSES':
        return this.handleViewExpenses(userExpenses, currency);
      
      case 'VIEW_ANALYTICS':
        return this.handleViewAnalytics(userExpenses, userIncomes, currency);
      
      case 'BUDGET_HELP':
        return this.handleBudgetHelp(userExpenses, userIncomes, currency);
      
      case 'DELETE_EXPENSE':
        return this.handleDeleteExpense(data, userExpenses, currency);
      
      default:
        return this.handleGeneralChat(originalMessage, currency);
    }
  }

  // Handle missing information with smart follow-up questions
  async handleMissingInformation(intent, originalMessage, currency = null) {
    const { intent: intentType, data, missingInfo, contextualInfo } = intent;
    
    let response = "";
    let suggestions = [];
    
    if (intentType === 'ADD_EXPENSE') {
      if (missingInfo.includes('amount')) {
        response = `I understand you want to add an expense for ${data.description || 'something'}, but I need to know the amount. How much did you spend?`;
        
        // Smart suggestions based on category
        if (data.category === 'food') {
          suggestions = ["$5-10 for coffee/snacks", "$15-25 for lunch", "$30-50 for dinner"];
        } else if (data.category === 'transport') {
          suggestions = ["$3-5 for bus/train", "$10-20 for taxi", "$30-50 for gas"];
        } else if (data.category === 'entertainment') {
          suggestions = ["$10-15 for streaming", "$25-35 for movies", "$50+ for events"];
        } else {
          suggestions = ["Under $10", "$10-50", "$50-100", "Over $100"];
        }
      } else if (missingInfo.includes('category')) {
        response = `I see you spent ${this.formatCurrency(data.amount, currency)}, but what category should this go under?`;
        suggestions = ["Food & Dining", "Transportation", "Entertainment", "Bills & Utilities", "Shopping", "Health", "Education", "Other"];
      }
    } else if (intentType === 'ADD_INCOME') {
      if (missingInfo.includes('amount')) {
        response = `I understand you received some income, but could you tell me how much?`;
        suggestions = ["Under $500", "$500-1000", "$1000-3000", "$3000+"];
      } else if (missingInfo.includes('source')) {
        response = `I see you received ${this.formatCurrency(data.amount, currency)}. What type of income is this?`;
        suggestions = ["Salary", "Freelance Work", "Investment Returns", "Business Income", "Other"];
      }
    }
    
    // Add contextual suggestions if available
    if (contextualInfo && contextualInfo.suggestedQuestions) {
      response += `\n\n${contextualInfo.suggestedQuestions.join(' ')}`;
    }
    
    return {
      response: response,
      action: {
        type: 'MISSING_INFO',
        intentType: intentType,
        missingInfo: missingInfo,
        partialData: data
      },
      success: false,
      suggestions: suggestions,
      awaitingInfo: missingInfo
    };
  }

  // Handle adding expense
  async handleAddExpense(data, originalMessage, currency = null, contextualInfo = null) {
    if (!data.amount || data.amount <= 0) {
      return {
        response: "I need to know how much you spent. Could you tell me the amount?",
        action: null,
        success: false
      };
    }

    const expenseData = {
      amount: data.amount,
      category: data.category || 'other',
      comments: data.description || 'Added via chatbot',
      paymentMethod: data.paymentMethod || 'card',
      date: data.date || new Date().toISOString()
    };

    // Smart response based on context
    let response = `Perfect! I'll add an expense of ${this.formatCurrency(data.amount, currency)} for ${data.description || 'miscellaneous'}`;
    
    if (contextualInfo && contextualInfo.brandMentioned) {
      response += ` at ${contextualInfo.brandMentioned}`;
    }
    
    response += ` in the ${data.category || 'other'} category.`;
    
    // Add helpful tips based on category
    let tip = "";
    if (data.category === 'food' && data.amount > 50) {
      tip = "\n\n💡 Tip: Consider meal planning to reduce food expenses!";
    } else if (data.category === 'entertainment' && data.amount > 100) {
      tip = "\n\n💡 Tip: Set an entertainment budget to track discretionary spending.";
    } else if (data.category === 'transport' && data.paymentMethod === 'cash') {
      tip = "\n\n💡 Tip: Using cards for transport can help track spending patterns better.";
    }

    return {
      response: response + tip,
      action: {
        type: 'ADD_EXPENSE',
        data: expenseData
      },
      success: true,
      smartTips: tip ? [tip.replace("\n\n💡 Tip: ", "")] : []
    };
  }

  // Handle adding income
  async handleAddIncome(data, originalMessage, currency = null, contextualInfo = null) {
    if (!data.amount || data.amount <= 0) {
      return {
        response: "I need to know how much income you received. Could you tell me the amount?",
        action: null,
        success: false
      };
    }

    const incomeData = {
      amount: data.amount,
      source: data.source || 'other',
      description: data.description || 'Added via chatbot',
      date: data.date || new Date().toISOString(),
      isRecurring: data.isRecurring || false,
      frequency: data.frequency || 'monthly'
    };

    return {
      response: `I'll add income of ${this.formatCurrency(data.amount, currency)} from ${data.source || 'other sources'}.`,
      action: {
        type: 'ADD_INCOME',
        data: incomeData
      },
      success: true
    };
  }

  // Handle viewing expenses
  async handleViewExpenses(userExpenses, currency = null) {
    if (!userExpenses || userExpenses.length === 0) {
      return {
        response: "You haven't recorded any expenses yet. Would you like to add one?",
        action: {
          type: 'VIEW_EXPENSES',
          data: []
        },
        success: true
      };
    }

    const totalExpenses = userExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const recentExpenses = userExpenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    const expenseList = recentExpenses
      .map(exp => `• ${this.formatCurrency(exp.amount, currency)} - ${exp.comments || exp.category}`)
      .join('\n');

    return {
      response: `Here's your expense summary:\n\nTotal spent: ${this.formatCurrency(totalExpenses, currency)}\nTotal transactions: ${userExpenses.length}\n\nRecent expenses:\n${expenseList}`,
      action: {
        type: 'VIEW_EXPENSES',
        data: {
          total: totalExpenses,
          count: userExpenses.length,
          recent: recentExpenses
        }
      },
      success: true
    };
  }

  // Handle analytics request
  async handleViewAnalytics(userExpenses, userIncomes, currency = null) {
    if (!userExpenses || userExpenses.length === 0) {
      return {
        response: "I need some expense data to provide analytics. Start by adding a few expenses!",
        action: {
          type: 'VIEW_ANALYTICS',
          data: null
        },
        success: false
      };
    }

    // Use existing AI service for analysis
    const totalIncome = userIncomes.reduce((sum, inc) => sum + inc.amount, 0);
    const analysis = await aiService.analyzeSpending(userExpenses, totalIncome);

    const insights = analysis.insights?.slice(0, 3).join('\n• ') || 'No insights available';
    const recommendations = analysis.recommendations?.slice(0, 2).join('\n• ') || 'No recommendations available';

    return {
      response: `Here's your spending analysis:\n\n📊 Key Insights:\n• ${insights}\n\n💡 Recommendations:\n• ${recommendations}\n\nFinancial Health Score: ${analysis.financialHealth?.score || 'N/A'}/100`,
      action: {
        type: 'VIEW_ANALYTICS',
        data: analysis
      },
      success: true
    };
  }

  // Handle budget help
  async handleBudgetHelp(userExpenses, userIncomes, currency = null) {
    const totalIncome = userIncomes.reduce((sum, inc) => sum + inc.amount, 0);
    
    if (totalIncome === 0) {
      return {
        response: "To help with budgeting, I need to know your income first. Could you add your income information?",
        action: {
          type: 'BUDGET_HELP',
          data: null
        },
        success: false
      };
    }

    const budgetRec = await aiService.generateBudgetRecommendations(userExpenses, totalIncome);
    
    const categoryBudgets = Object.entries(budgetRec.categoryBudgets || {})
      .map(([category, amount]) => `• ${category}: ${this.formatCurrency(amount, currency)}`)
      .join('\n');

    return {
      response: `Based on your income of ${this.formatCurrency(totalIncome, currency)}, here's my budget recommendation:\n\n💰 Total Monthly Budget: ${this.formatCurrency(budgetRec.totalBudget, currency)}\n🎯 Savings Target: ${this.formatCurrency(budgetRec.savingsTarget, currency)}\n\n📋 Category Budgets:\n${categoryBudgets}`,
      action: {
        type: 'BUDGET_HELP',
        data: budgetRec
      },
      success: true
    };
  }

  // Handle delete expense
  async handleDeleteExpense(data, userExpenses, currency = null) {
    if (!userExpenses || userExpenses.length === 0) {
      return {
        response: "You don't have any expenses to delete.",
        action: null,
        success: false
      };
    }

    // Find the most recent expense or match by description
    let expenseToDelete = userExpenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    if (data.description) {
      const matchingExpense = userExpenses.find(exp => 
        exp.comments?.toLowerCase().includes(data.description.toLowerCase()) ||
        exp.category?.toLowerCase().includes(data.description.toLowerCase())
      );
      if (matchingExpense) {
        expenseToDelete = matchingExpense;
      }
    }

    return {
      response: `I'll delete the expense: ${this.formatCurrency(expenseToDelete.amount, currency)} for ${expenseToDelete.comments || expenseToDelete.category}`,
      action: {
        type: 'DELETE_EXPENSE',
        data: { id: expenseToDelete.id || expenseToDelete._id }
      },
      success: true
    };
  }

  // Handle general conversation
  async handleGeneralChat(message, currency = null) {
    const helpMessage = `Hi! I'm your personal finance assistant. Here's what I can help you with:

💰 **Add expenses**: "I spent ${this.formatCurrency(25, currency)} on lunch" or "Add ${this.formatCurrency(50, currency)} gas expense"
📈 **Add income**: "I got paid ${this.formatCurrency(3000, currency)}" or "Add salary income"
📊 **View expenses**: "Show my expenses" or "What did I spend this month?"
📈 **Analytics**: "Analyze my spending" or "Show spending insights"
💡 **Budget help**: "Help me budget" or "Budget recommendations"
🗑️ **Delete expenses**: "Delete my last expense"

Just tell me what you'd like to do in natural language!`;

    return {
      response: helpMessage,
      action: null,
      success: true
    };
  }

  // Fallback intent parsing
  basicIntentParsing(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for expense-related keywords
    if (lowerMessage.includes('spent') || lowerMessage.includes('expense') || lowerMessage.includes('bought') || lowerMessage.includes('paid')) {
      // Extract amount using regex
      const amountMatch = message.match(/\$?(\d+(?:\.\d{2})?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : null;
      
      return {
        intent: 'ADD_EXPENSE',
        confidence: amount ? 0.8 : 0.3,
        data: {
          amount: amount,
          category: 'other',
          description: message,
          paymentMethod: 'card'
        }
      };
    }

    // Check for income-related keywords
    if (lowerMessage.includes('income') || lowerMessage.includes('salary') || lowerMessage.includes('paid') || lowerMessage.includes('earned')) {
      const amountMatch = message.match(/\$?(\d+(?:\.\d{2})?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : null;
      
      return {
        intent: 'ADD_INCOME',
        confidence: amount ? 0.8 : 0.3,
        data: {
          amount: amount,
          source: 'other',
          description: message
        }
      };
    }

    // Check for view-related keywords
    if (lowerMessage.includes('show') || lowerMessage.includes('view') || lowerMessage.includes('expenses')) {
      return {
        intent: 'VIEW_EXPENSES',
        confidence: 0.7,
        data: {}
      };
    }

    // Default to general chat
    return {
      intent: 'GENERAL_CHAT',
      confidence: 0.5,
      data: {}
    };
  }
}

module.exports = new ChatbotService();