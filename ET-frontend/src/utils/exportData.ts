import { type Expense } from '@/api';

export interface ExportOptions {
  format: 'csv' | 'json';
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
}

export function exportExpensesToCSV(expenses: Expense[], filename?: string): void {
  if (expenses.length === 0) {
    throw new Error('No expenses to export');
  }

  // CSV headers
  const headers = ['Date', 'Category', 'Description', 'Amount', 'Created At', 'Updated At'];
  
  // Convert expenses to CSV rows
  const csvRows = expenses.map(expense => [
    new Date(expense.date).toLocaleDateString(),
    expense.category,
    expense.comments || '',
    expense.amount.toFixed(2),
    new Date(expense.createdAt).toLocaleString(),
    new Date(expense.updatedAt).toLocaleString(),
  ]);

  // Combine headers and rows
  const csvContent = [headers, ...csvRows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function exportExpensesToJSON(expenses: Expense[], filename?: string): void {
  if (expenses.length === 0) {
    throw new Error('No expenses to export');
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    totalExpenses: expenses.length,
    totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    expenses: expenses.map(expense => ({
      id: expense.id,
      amount: expense.amount,
      description: expense.comments || '',
      category: expense.category,
      date: expense.date,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    })),
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `expenses_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function filterExpensesByDateRange(
  expenses: Expense[], 
  startDate: Date, 
  endDate: Date
): Expense[] {
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
}

export function filterExpensesByCategories(
  expenses: Expense[], 
  categories: string[]
): Expense[] {
  if (categories.length === 0) return expenses;
  return expenses.filter(expense => categories.includes(expense.category));
}