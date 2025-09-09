import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { type Expense } from '@/api';
import { useCurrency } from '@/contexts/CurrencyContext';

interface CategoryStatsProps {
  expenses: Expense[];
  categories: { id: string; name: string; color: string }[];
}

export const CategoryStats: React.FC<CategoryStatsProps> = ({ expenses, categories }) => {
  const { formatCurrency } = useCurrency();
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate category statistics
  const categoryStats = categories.map(category => {
    const categoryExpenses = expenses.filter(expense => expense.category === category.id);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const percentage = totalSpent > 0 ? (total / totalSpent) * 100 : 0;
    const transactionCount = categoryExpenses.length;

    // Calculate trend (comparing with previous period - simplified)
    const recentExpenses = categoryExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return expenseDate >= threeDaysAgo;
    });
    
    const olderExpenses = categoryExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const sixDaysAgo = new Date();
      sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
      return expenseDate < threeDaysAgo && expenseDate >= sixDaysAgo;
    });

    const recentTotal = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const olderTotal = olderExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentTotal > olderTotal * 1.2) trend = 'up';
    else if (recentTotal < olderTotal * 0.8) trend = 'down';

    return {
      ...category,
      total,
      percentage,
      transactionCount,
      trend,
      hasData: total > 0,
    };
  }).filter(stat => stat.hasData).sort((a, b) => b.total - a.total);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-destructive" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-success" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-destructive';
      case 'down':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-medium animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-foreground">Category Breakdown</h3>
        <span className="text-sm text-muted-foreground">
          Total: {formatCurrency(totalSpent)}
        </span>
      </div>

      {categoryStats.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No expenses to analyze</p>
          <p className="text-sm text-muted-foreground mt-1">Add some expenses to see category insights</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categoryStats.map((stat, index) => (
            <div 
              key={stat.id} 
              className="p-4 bg-surface rounded-lg hover:bg-primary/5 transition-all duration-200"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: `hsl(var(--${stat.color}))` }}
                  />
                  <span className="font-medium text-foreground">{stat.name}</span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(stat.trend)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(stat.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.transactionCount} transaction{stat.transactionCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    {stat.percentage.toFixed(1)}% of total spending
                  </span>
                  <span className={`text-xs ${getTrendColor(stat.trend)}`}>
                    {stat.trend === 'up' && 'Trending up'}
                    {stat.trend === 'down' && 'Trending down'}
                    {stat.trend === 'stable' && 'Stable'}
                  </span>
                </div>
                <div className="relative">
                  <Progress 
                    value={stat.percentage} 
                    className="h-2"
                  />
                  <div 
                    className="absolute inset-0 rounded-full opacity-50"
                    style={{ 
                      background: `linear-gradient(90deg, hsl(var(--${stat.color})) 0%, hsl(var(--${stat.color}) / 0.5) 100%)`,
                      width: `${stat.percentage}%`
                    }}
                  />
                </div>
              </div>

              {/* Category Insights */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Avg per transaction: {formatCurrency(stat.total / stat.transactionCount)}
                </span>
                <span className="text-muted-foreground">
                  {((stat.total / totalSpent) * 100).toFixed(0)}% of budget
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Insights */}
      {categoryStats.length > 0 && (
        <div className="mt-6 p-4 bg-primary/5 rounded-lg">
          <h4 className="text-sm font-semibold text-foreground mb-2">💡 Insights</h4>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              • Top category: <span className="text-foreground font-medium">{categoryStats[0].name}</span> ({formatCurrency(categoryStats[0].total)})
            </p>
            {categoryStats.find(s => s.trend === 'up') && (
              <p className="text-xs text-destructive">
                • Some categories are trending upward - consider monitoring spending
              </p>
            )}
            {categoryStats.length >= 3 && (
              <p className="text-xs text-muted-foreground">
                • You're spending across {categoryStats.length} different categories
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};