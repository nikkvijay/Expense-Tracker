import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { type Expense } from '@/api';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ExpenseBarGraphProps {
  expenses: Expense[];
}

export const ExpenseBarGraph: React.FC<ExpenseBarGraphProps> = ({ expenses }) => {
  const { formatCurrency } = useCurrency();
  
  // Calculate daily spending for the last 7 days
  const dailySpending = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.toDateString() === date.toDateString();
    });
    
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      amount: dayExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card rounded-lg p-3 shadow-medium">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-sm text-primary">
            Amount: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-4 sm:p-6 bg-gradient-card shadow-medium animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Daily Spending (Last 7 Days)</h3>
      <div className="h-48 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailySpending} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" />
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="amount" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Daily Summary */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
        <span className="text-muted-foreground">
          7-day total: {formatCurrency(dailySpending.reduce((sum, day) => sum + day.amount, 0))}
        </span>
        <span className="text-muted-foreground">
          Daily avg: {formatCurrency(dailySpending.reduce((sum, day) => sum + day.amount, 0) / 7)}
        </span>
      </div>
    </Card>
  );
};