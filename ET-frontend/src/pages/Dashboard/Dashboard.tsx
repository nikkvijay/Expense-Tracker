import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, PieChart, DollarSign, Plus, ArrowUpRight, ArrowDownRight, Target, Calendar, CreditCard, Wallet } from "lucide-react";
import { getExpenses, getTotalIncome, type Expense } from '@/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import { toast } from 'sonner';
import { ChatbotButton } from '@/components/chatbot/ChatbotButton';
import { CalculatorWidget } from '@/components/calculator/CalculatorWidget';

const Dashboard = () => {
  const { formatCurrency } = useCurrency();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentDate = new Date();
      const [expensesData, incomeData] = await Promise.all([
        getExpenses(),
        getTotalIncome(currentDate.getMonth() + 1, currentDate.getFullYear()),
      ]);
      
      setExpenses(expensesData);
      setTotalIncome(incomeData.total);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Calculate financial metrics
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netAmount = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netAmount / totalIncome) * 100) : 0;
  
  // Get recent expenses (last 5)
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Get this week's expenses
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekExpenses = expenses.filter(expense => 
    new Date(expense.date) >= oneWeekAgo
  );
  const thisWeekTotal = thisWeekExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Categories data
  const categories = [
    { id: "food", name: "Food & Dining", color: "category-food" },
    { id: "transport", name: "Transport", color: "category-transport" },
    { id: "entertainment", name: "Entertainment", color: "category-entertainment" },
    { id: "bills", name: "Bills & Utilities", color: "category-bills" },
    { id: "shopping", name: "Shopping", color: "category-shopping" },
    { id: "health", name: "Health & Fitness", color: "category-health" },
    { id: "education", name: "Education", color: "category-education" },
    { id: "other", name: "Other", color: "category-other" },
  ];

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[categories.length - 1];
  };

  const getPaymentMethodInfo = (method: string) => {
    const methods = {
      card: { icon: '💳', name: 'Card' },
      cash: { icon: '💵', name: 'Cash' },
      account: { icon: '🏦', name: 'Bank' },
      digital: { icon: '📱', name: 'Digital' },
    };
    return methods[method as keyof typeof methods] || methods.card;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Financial Dashboard
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Your complete financial overview at a glance
          </p>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-card border-0 shadow-medium hover:shadow-large transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-success/10 rounded-lg">
                  <ArrowUpRight className="h-4 w-4 text-success" />
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-medium hover:shadow-large transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <ArrowDownRight className="h-4 w-4 text-destructive" />
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground mt-1">{expenses.length} transactions</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-medium hover:shadow-large transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${netAmount >= 0 ? 'bg-primary/10' : 'bg-warning/10'}`}>
                  <DollarSign className={`h-4 w-4 ${netAmount >= 0 ? 'text-primary' : 'text-warning'}`} />
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {netAmount >= 0 ? 'Net Surplus' : 'Net Deficit'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netAmount >= 0 ? 'text-primary' : 'text-warning'}`}>
                {formatCurrency(Math.abs(netAmount))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Current balance</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-medium hover:shadow-large transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Target className="h-4 w-4 text-accent" />
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">Savings Rate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{savingsRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Of total income</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/expense-tracker">
            <Card className="bg-gradient-card border-0 shadow-medium hover:shadow-large transition-all duration-300 group cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">Add Expense</CardTitle>
                    <CardDescription className="text-xs">Quick entry</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/expense-tracker">
            <Card className="bg-gradient-card border-0 shadow-medium hover:shadow-large transition-all duration-300 group cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg group-hover:bg-success/20 transition-colors">
                    <Wallet className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">Income Tracker</CardTitle>
                    <CardDescription className="text-xs">Manage income</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/analytics">
            <Card className="bg-gradient-card border-0 shadow-medium hover:shadow-large transition-all duration-300 group cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                    <PieChart className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                    <CardDescription className="text-xs">View insights</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/expense-tracker">
            <Card className="bg-gradient-card border-0 shadow-medium hover:shadow-large transition-all duration-300 group cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg group-hover:bg-warning/20 transition-colors">
                    <Calendar className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">Calendar</CardTitle>
                    <CardDescription className="text-xs">View by date</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Recent Expenses */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Expenses</CardTitle>
              <Link to="/expense-tracker">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentExpenses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No expenses yet</p>
                  <Link to="/expense-tracker">
                    <Button size="sm" className="bg-gradient-primary">
                      Add First Expense
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentExpenses.map((expense) => {
                    const categoryInfo = getCategoryInfo(expense.category);
                    const paymentInfo = getPaymentMethodInfo(expense.paymentMethod);
                    return (
                      <div key={expense.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: `hsl(var(--${categoryInfo.color}))` }}
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {expense.description || expense.comments || 'No description'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{categoryInfo.name}</span>
                              <span>•</span>
                              <span>{paymentInfo.icon} {paymentInfo.name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-foreground">
                            {formatCurrency(expense.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Insights */}
          <Card className="bg-gradient-card border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="text-lg">Financial Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* This Week's Spending */}
              <div className="p-4 bg-surface rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground">This Week's Spending</h4>
                  <span className="text-sm font-semibold text-primary">
                    {formatCurrency(thisWeekTotal)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {thisWeekExpenses.length} transactions in the last 7 days
                </p>
              </div>

              {/* Top Category */}
              {expenses.length > 0 && (
                <div className="p-4 bg-surface rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-foreground">Top Spending Category</h4>
                  </div>
                  {(() => {
                    const categoryTotals = categories.map(category => ({
                      ...category,
                      total: expenses
                        .filter(expense => expense.category === category.id)
                        .reduce((sum, expense) => sum + expense.amount, 0)
                    })).filter(item => item.total > 0)
                    .sort((a, b) => b.total - a.total);
                    
                    const topCategory = categoryTotals[0];
                    return topCategory ? (
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: `hsl(var(--${topCategory.color}))` }}
                        />
                        <div className="flex items-center justify-between w-full">
                          <span className="text-sm text-muted-foreground">{topCategory.name}</span>
                          <span className="text-sm font-semibold text-foreground">
                            {formatCurrency(topCategory.total)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No category data available</p>
                    );
                  })()}
                </div>
              )}

              {/* Financial Health Score */}
              <div className="p-4 bg-surface rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground">Financial Health</h4>
                  <span className={`text-sm font-semibold ${savingsRate >= 20 ? 'text-success' : savingsRate >= 10 ? 'text-warning' : 'text-destructive'}`}>
                    {savingsRate >= 20 ? 'Great' : savingsRate >= 10 ? 'Good' : 'Needs Attention'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {savingsRate >= 20 
                    ? 'You\'re saving well! Keep it up.'
                    : savingsRate >= 10 
                    ? 'Consider increasing your savings rate.'
                    : 'Try to reduce expenses or increase income.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calculator Tools Section */}
        <div className="mt-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Financial Tools</h2>
            <p className="text-muted-foreground">Calculator and currency converter to help with your finances</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Basic Calculator */}
            <div className="flex justify-center">
              <CalculatorWidget defaultTab="calculator" showTabs={false} />
            </div>
            
            {/* Currency Converter */}
            <div className="flex justify-center">
              <CalculatorWidget defaultTab="converter" showTabs={false} />
            </div>
          </div>
        </div>

        {/* Chatbot Button */}
        <ChatbotButton 
          onExpenseAdded={loadDashboardData}
          onIncomeAdded={loadDashboardData}
        />
      </div>
    </div>
  );
};

export default Dashboard;