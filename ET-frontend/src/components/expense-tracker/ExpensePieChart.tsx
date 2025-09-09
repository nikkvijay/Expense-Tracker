import React from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { type Expense } from '@/api';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ExpensePieChartProps {
  expenses: Expense[];
  categories: { id: string; name: string; color: string }[];
}

export const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ expenses, categories }) => {
  const { formatCurrency } = useCurrency();
  
  // Calculate category totals
  const categoryTotals = categories.map(category => {
    const total = expenses
      .filter(expense => expense.category === category.id)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: category.name,
      value: total,
      color: `hsl(var(--${category.color}))`,
      categoryId: category.id,
    };
  }).filter(item => item.value > 0);

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card rounded-lg p-3 shadow-medium">
          <p className="text-sm font-medium text-foreground">{payload[0].name}</p>
          <p className="text-sm text-primary">
            Amount: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-muted-foreground">
            {((payload[0].value / categoryTotals.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-4 sm:p-6 bg-gradient-card shadow-medium animate-slide-up">
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Spending by Category</h3>
      <div className="h-48 sm:h-64">
        {categoryTotals.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryTotals}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryTotals.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No data to display</p>
          </div>
        )}
      </div>
      
      {/* Legend */}
      {categoryTotals.length > 0 && (
        <div className="mt-4 space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
          {categoryTotals.map((item) => (
            <div key={item.categoryId} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-foreground truncate">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};