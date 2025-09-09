import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, Tag, Edit2, CreditCard, Plus } from 'lucide-react';
import { type Expense } from '@/api';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ExpenseListProps {
  expenses: Expense[];
  categories: { id: string; name: string; color: string }[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
  onAddExpense?: () => void; // Add this prop for the button
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  categories,
  onDeleteExpense,
  onEditExpense,
  onAddExpense,
}) => {
  const { formatCurrency } = useCurrency();
  
  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId) || categories[categories.length - 1];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
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

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card className="p-6 bg-gradient-card shadow-medium">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Recent Expenses</h3>
          <p className="text-sm text-muted-foreground">
            {expenses.length} transaction{expenses.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {onAddExpense && (
          <Button
            onClick={onAddExpense}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {sortedExpenses.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No expenses yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first expense to get started!
            </p>
            {onAddExpense && (
              <Button
                onClick={onAddExpense}
                className="mt-4 bg-gradient-primary hover:shadow-glow transition-all duration-300"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Expense
              </Button>
            )}
          </div>
        ) : (
          sortedExpenses.map((expense, index) => {
            const categoryInfo = getCategoryInfo(expense.category);
            return (
              <div
                key={expense.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-surface rounded-lg hover:bg-primary/5 hover:shadow-soft transition-all duration-200 animate-fade-in gap-3"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: `hsl(var(--${categoryInfo.color}))`,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {expense.description || expense.comments || 'No description'}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Tag className="h-3 w-3" />
                        <span className="truncate">{categoryInfo.name}</span>
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(expense.date)}
                      </span>
                      {expense.paymentMethod && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span>
                            {getPaymentMethodInfo(expense.paymentMethod).icon}
                          </span>
                          <span className="truncate">
                            {getPaymentMethodInfo(expense.paymentMethod).name}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 w-full sm:w-auto">
                  <span className="text-lg font-bold text-foreground">
                    {formatCurrency(expense.amount)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditExpense(expense)}
                      className="hover:text-primary hover:bg-primary/10 p-2 h-8 w-8"
                      title="Edit expense"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteExpense(expense.id)}
                      className="hover:text-destructive hover:bg-destructive/10 p-2 h-8 w-8"
                      title="Delete expense"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Show more button for large lists */}
      {expenses.length > 10 && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View All Expenses
          </Button>
        </div>
      )}
    </Card>
  );
};

const DollarSign = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
    />
  </svg>
);