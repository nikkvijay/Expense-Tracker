import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Edit2, Check, X, AlertTriangle, TrendingUp } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface BudgetTrackerProps {
  totalSpent: number;
  monthlyBudget: number;
  onBudgetChange: (budget: number) => void;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  totalSpent,
  monthlyBudget,
  onBudgetChange,
}) => {
  const { formatCurrency } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [tempBudget, setTempBudget] = useState(monthlyBudget.toString());

  const budgetUsed = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const remaining = monthlyBudget - totalSpent;
  const isOverBudget = totalSpent > monthlyBudget;

  const handleSaveBudget = async () => {
    const newBudget = parseFloat(tempBudget);
    if (newBudget > 0) {
      try {
        await onBudgetChange(newBudget);
        setIsEditing(false);
      } catch (error) {
        // Error is handled by parent component
      }
    }
  };

  const handleCancelEdit = () => {
    setTempBudget(monthlyBudget.toString());
    setIsEditing(false);
  };

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-destructive';
    if (budgetUsed > 80) return 'bg-warning';
    if (budgetUsed > 60) return 'bg-primary';
    return 'bg-success';
  };

  const getStatusIcon = () => {
    if (isOverBudget) return <AlertTriangle className="h-5 w-5 text-destructive" />;
    if (budgetUsed > 80) return <AlertTriangle className="h-5 w-5 text-warning" />;
    return <TrendingUp className="h-5 w-5 text-success" />;
  };

  const getStatusText = () => {
    if (isOverBudget) return 'Over Budget';
    if (budgetUsed > 80) return 'Near Limit';
    if (budgetUsed > 60) return 'On Track';
    return 'Looking Good';
  };

  const getStatusColor = () => {
    if (isOverBudget) return 'text-destructive';
    if (budgetUsed > 80) return 'text-warning';
    return 'text-success';
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-medium animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground">Monthly Budget</h3>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Budget Amount */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Budget Amount</span>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 px-2 hover:bg-primary/10"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveBudget}
                className="h-8 px-2 hover:bg-success/10 text-success"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="h-8 px-2 hover:bg-destructive/10 text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        {!isEditing ? (
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(monthlyBudget)}
          </p>
        ) : (
          <Input
            type="number"
            value={tempBudget}
            onChange={(e) => setTempBudget(e.target.value)}
            className="text-xl font-bold"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveBudget();
              if (e.key === 'Escape') handleCancelEdit();
            }}
          />
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Budget Used</span>
          <span className="text-sm font-medium text-foreground">
            {Math.min(budgetUsed, 100).toFixed(1)}%
          </span>
        </div>
        <div className="relative">
          <Progress 
            value={Math.min(budgetUsed, 100)} 
            className="h-3"
          />
          {isOverBudget && (
            <div className="absolute inset-0 bg-destructive/20 rounded-full animate-glow-pulse" />
          )}
        </div>
      </div>

      {/* Spending Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-surface rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Spent</p>
          <p className="text-lg font-bold text-foreground">
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="text-center p-3 bg-surface rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">
            {isOverBudget ? 'Over by' : 'Remaining'}
          </p>
          <p className={`text-lg font-bold ${isOverBudget ? 'text-destructive' : 'text-success'}`}>
            {formatCurrency(Math.abs(remaining))}
          </p>
        </div>
      </div>

      {/* Budget Tips */}
      {budgetUsed > 80 && (
        <div className="mt-4 p-3 bg-warning/10 rounded-lg">
          <p className="text-sm text-warning-foreground">
            {isOverBudget 
              ? '💡 Consider reviewing your expenses and adjusting your budget for next month.'
              : '⚠️ You\'re approaching your budget limit. Consider tracking expenses more carefully.'
            }
          </p>
        </div>
      )}
    </Card>
  );
};