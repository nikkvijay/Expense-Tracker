import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
} from "lucide-react";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseList } from "./ExpenseList";
import { IncomeTracker } from "./IncomeTracker";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getTotalIncome,
  type Expense,
  type ExpenseInput,
} from "@/api";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";
import { ChatbotButton } from "@/components/chatbot/ChatbotButton";

const EXPENSE_CATEGORIES = [
  { id: "food", name: "Food & Dining", color: "category-food" },
  { id: "transport", name: "Transport", color: "category-transport" },
  {
    id: "entertainment",
    name: "Entertainment",
    color: "category-entertainment",
  },
  { id: "bills", name: "Bills & Utilities", color: "category-bills" },
  { id: "shopping", name: "Shopping", color: "category-shopping" },
  { id: "health", name: "Health & Fitness", color: "category-health" },
  { id: "education", name: "Education", color: "category-education" },
  { id: "other", name: "Other", color: "category-other" },
];

export const ExpenseTracker: React.FC = () => {
  const { formatCurrency } = useCurrency();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [incomeRefreshTrigger, setIncomeRefreshTrigger] = useState(0);

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load expenses only - income will be loaded by IncomeTracker
      const expensesData = await getExpenses();
      setExpenses(expensesData);

      // Trigger income component refresh (which will update monthlyIncome via onIncomeChange)
      setIncomeRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      console.error("Failed to load data:", err);
      setError("Failed to load expenses. Please try again.");
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addExpense = async (expenseData: ExpenseInput) => {
    try {
      const newExpense = await createExpense(expenseData);
      setExpenses((prev) => [newExpense, ...prev]);
      toast.success("Expense added successfully");
    } catch (err: any) {
      console.error("Failed to add expense:", err);
      toast.error("Failed to add expense");
      throw err; // Re-throw so the form can handle it
    }
  };

  const handleUpdateExpense = async (id: string, expenseData: ExpenseInput) => {
    try {
      const updatedExpense = await updateExpense(id, expenseData);
      setExpenses((prev) =>
        prev.map((expense) => (expense.id === id ? updatedExpense : expense))
      );
      setEditingExpense(null);
      toast.success("Expense updated successfully");
    } catch (err: any) {
      console.error("Failed to update expense:", err);
      toast.error("Failed to update expense");
      throw err; // Re-throw so the form can handle it
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
      toast.success("Expense deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete expense:", err);
      toast.error("Failed to delete expense");
    }
  };

  const handleCloseForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  const handleIncomeChange = (newIncome: number) => {
    setMonthlyIncome(newIncome);
  };

  // Calculate totals
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const incomeUsed = monthlyIncome > 0 ? (totalSpent / monthlyIncome) * 100 : 0;
  const remaining = monthlyIncome - totalSpent;

  const currentMonth = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your expenses...</p>
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-card border-0 shadow-medium hover:shadow-large transition-shadows duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-0 shadow-medium hover:shadow-large transition-shadows duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-xl">
                <Target className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Income</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(monthlyIncome)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-0 shadow-medium hover:shadow-large transition-shadows duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-xl">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Income Used</p>
                <p className="text-2xl font-bold text-foreground">
                  {incomeUsed.toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-0 shadow-medium hover:shadow-large transition-shadows duration-300">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  remaining >= 0 ? "bg-success/10" : "bg-destructive/10"
                }`}
              >
                {remaining >= 0 ? (
                  <TrendingDown className="h-6 w-6 text-success" />
                ) : (
                  <TrendingUp className="h-6 w-6 text-destructive" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {remaining >= 0 ? "Remaining" : "Over Budget"}
                </p>
                <p
                  className={`text-2xl font-bold ${
                    remaining >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {formatCurrency(Math.abs(remaining))}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Add Button & Budget */}
          <div className="space-y-6">
            {/* Add New Expense Button */}

            {/* Income Tracker */}
            <div className="w-full">
              <IncomeTracker
                totalSpent={totalSpent}
                onIncomeChange={handleIncomeChange}
                refreshTrigger={incomeRefreshTrigger}
              />
            </div>
          </div>

          {/* Right Column - Recent Expenses */}
          <div className="w-full">
            <ExpenseList
              expenses={expenses}
              categories={EXPENSE_CATEGORIES}
              onDeleteExpense={handleDeleteExpense}
              onEditExpense={handleEditExpense}
              onAddExpense={() => setShowExpenseForm(true)}
            />
          </div>
        </div>

        {/* Expense Form Modal */}
        <ExpenseForm
          isOpen={showExpenseForm}
          onClose={handleCloseForm}
          onAddExpense={addExpense}
          onUpdateExpense={handleUpdateExpense}
          editingExpense={editingExpense}
          categories={EXPENSE_CATEGORIES}
          defaultDate={null}
        />

        {/* Chatbot Button */}
        <ChatbotButton onExpenseAdded={loadData} onIncomeAdded={loadData} />
      </div>
    </div>
  );
};
