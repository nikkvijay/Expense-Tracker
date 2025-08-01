import React, { useState, useEffect } from 'react';
import { ExpensePieChart } from '@/components/expense-tracker/ExpensePieChart';
import { ExpenseBarGraph } from '@/components/expense-tracker/ExpenseBarGraph';
import { ExpenseCalendar } from '@/components/expense-tracker/ExpenseCalendar';
import { ExpenseForm } from '@/components/expense-tracker/ExpenseForm';
import { PaymentMethodChart } from '@/components/expense-tracker/PaymentMethodChart';
import { Card } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { getExpenses, createExpense, updateExpense, deleteExpense, getTotalIncome, type Expense, type ExpenseInput } from '@/api';
import { toast } from 'sonner';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ChatbotButton } from '@/components/chatbot/ChatbotButton';

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

const Analytics = () => {
  const { formatCurrency } = useCurrency();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const loadData = async () => {
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
      console.error('Failed to load data:', err);
      setError('Failed to load data. Please try again.');
      toast.error('Failed to load data');
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
      setExpenses(prev => [newExpense, ...prev]);
      toast.success('Expense added successfully');
    } catch (err: any) {
      console.error('Failed to add expense:', err);
      toast.error('Failed to add expense');
      throw err;
    }
  };

  const handleUpdateExpense = async (id: string, expenseData: ExpenseInput) => {
    try {
      const updatedExpense = await updateExpense(id, expenseData);
      setExpenses(prev => prev.map(expense => 
        expense.id === id ? updatedExpense : expense
      ));
      setEditingExpense(null);
      toast.success('Expense updated successfully');
    } catch (err: any) {
      console.error('Failed to update expense:', err);
      toast.error('Failed to update expense');
      throw err;
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      toast.success('Expense deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete expense:', err);
      toast.error('Failed to delete expense');
    }
  };

  const handleCloseForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(null);
    setSelectedDate(null);
  };

  const handleAddExpense = (date?: Date) => {
    setSelectedDate(date || null);
    setShowExpenseForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Analytics Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Visualize your spending patterns and financial insights
          </p>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-card border-0 shadow-medium">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-lg font-semibold text-success">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-card border-0 shadow-medium">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-lg font-semibold text-destructive">
                  {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-card border-0 shadow-medium">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${totalIncome >= expenses.reduce((sum, exp) => sum + exp.amount, 0) ? 'bg-primary/10' : 'bg-warning/10'}`}>
                <DollarSign className={`h-5 w-5 ${totalIncome >= expenses.reduce((sum, exp) => sum + exp.amount, 0) ? 'text-primary' : 'text-warning'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {totalIncome >= expenses.reduce((sum, exp) => sum + exp.amount, 0) ? 'Net Surplus' : 'Net Deficit'}
                </p>
                <p className={`text-lg font-semibold ${totalIncome >= expenses.reduce((sum, exp) => sum + exp.amount, 0) ? 'text-primary' : 'text-warning'}`}>
                  {formatCurrency(Math.abs(totalIncome - expenses.reduce((sum, exp) => sum + exp.amount, 0)))}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-card border-0 shadow-medium">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Target className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Savings Rate</p>
                <p className="text-lg font-semibold text-accent">
                  {totalIncome > 0 ? (((totalIncome - expenses.reduce((sum, exp) => sum + exp.amount, 0)) / totalIncome) * 100).toFixed(1) : '0'}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Grid - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 mb-8">
          <div className="w-full">
            <ExpensePieChart 
              expenses={expenses} 
              categories={EXPENSE_CATEGORIES} 
            />
          </div>
          <div className="w-full">
            <ExpenseBarGraph 
              expenses={expenses} 
            />
          </div>
          <div className="w-full lg:col-span-2 xl:col-span-1">
            <PaymentMethodChart 
              expenses={expenses} 
            />
          </div>
        </div>

        {/* Calendar Section */}
        <div className="w-full">
          <ExpenseCalendar
            expenses={expenses}
            categories={EXPENSE_CATEGORIES}
            onDeleteExpense={handleDeleteExpense}
            onEditExpense={handleEditExpense}
            onAddExpense={handleAddExpense}
          />
        </div>

        {/* Expense Form Modal */}
        <ExpenseForm
          isOpen={showExpenseForm}
          onClose={handleCloseForm}
          onAddExpense={addExpense}
          onUpdateExpense={handleUpdateExpense}
          editingExpense={editingExpense}
          categories={EXPENSE_CATEGORIES}
          defaultDate={selectedDate}
        />

        {/* Chatbot Button */}
        <ChatbotButton 
          onExpenseAdded={loadData}
          onIncomeAdded={loadData}
        />
      </div>
    </div>
  );
};

export default Analytics;