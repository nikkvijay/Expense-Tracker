import React from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { type Expense } from '@/api';
import { useCurrency } from '@/contexts/CurrencyContext';

interface PaymentMethodChartProps {
  expenses: Expense[];
}

export const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ expenses }) => {
  const { formatCurrency } = useCurrency();
  
  const paymentMethods = {
    card: { icon: '💳', name: 'Card', color: 'hsl(var(--chart-1))' },
    cash: { icon: '💵', name: 'Cash', color: 'hsl(var(--chart-2))' },
    account: { icon: '🏦', name: 'Bank Account', color: 'hsl(var(--chart-3))' },
    digital: { icon: '📱', name: 'Digital Wallet', color: 'hsl(var(--chart-4))' },
  };

  // Calculate payment method totals
  const paymentMethodTotals = Object.entries(paymentMethods).map(([key, method]) => {
    const total = expenses
      .filter(expense => expense.paymentMethod === key)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: method.name,
      value: total,
      color: method.color,
      icon: method.icon,
      methodId: key,
    };
  }).filter(item => item.value > 0);

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const totalExpenses = paymentMethodTotals.reduce((sum, item) => sum + item.value, 0);
      const percentage = totalExpenses > 0 ? ((payload[0].value / totalExpenses) * 100).toFixed(1) : '0';
      
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-medium">
          <div className="flex items-center gap-2 mb-1">
            <span>{payload[0].payload.icon}</span>
            <p className="text-sm font-medium text-foreground">{payload[0].name}</p>
          </div>
          <p className="text-sm text-primary">
            Amount: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-muted-foreground">
            {percentage}% of total spending
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-4 sm:p-6 bg-gradient-card border-0 shadow-medium animate-slide-up">
      <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">Spending by Payment Method</h3>
      <div className="h-48 sm:h-64">
        {paymentMethodTotals.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentMethodTotals}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {paymentMethodTotals.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No payment method data to display</p>
          </div>
        )}
      </div>
      
      {/* Legend */}
      {paymentMethodTotals.length > 0 && (
        <div className="mt-4 space-y-2">
          {paymentMethodTotals.map((item) => (
            <div key={item.methodId} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
                <span className="text-sm text-foreground truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {((item.value / paymentMethodTotals.reduce((sum, method) => sum + method.value, 0)) * 100).toFixed(1)}%
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(item.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};