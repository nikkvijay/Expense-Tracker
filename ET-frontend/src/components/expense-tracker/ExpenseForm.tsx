import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Calendar, Tag, CreditCard } from 'lucide-react';
import { type ExpenseInput, type Expense } from '@/api';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: ExpenseInput) => Promise<void>;
  onUpdateExpense?: (id: string, expense: ExpenseInput) => Promise<void>;
  categories: { id: string; name: string; color: string }[];
  editingExpense?: Expense | null;
  defaultDate?: Date | null;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  onUpdateExpense,
  categories,
  editingExpense,
  defaultDate,
}) => {
  const { currency } = useCurrency();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'account' | 'digital'>('card');
  const [date, setDate] = useState(() => {
    if (defaultDate) {
      // Format date without timezone conversion
      const year = defaultDate.getFullYear();
      const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
      const day = String(defaultDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return new Date().toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Populate form when editing
  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setDescription(editingExpense.comments || '');
      setCategory(editingExpense.category);
      setPaymentMethod(editingExpense.paymentMethod || 'card');
      setDate(new Date(editingExpense.date).toISOString().split('T')[0]);
    } else {
      // Reset form for adding new expense
      setAmount('');
      setDescription('');
      setCategory('');
      setPaymentMethod('card');
      if (defaultDate) {
        // Format date without timezone conversion
        const year = defaultDate.getFullYear();
        const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
        const day = String(defaultDate.getDate()).padStart(2, '0');
        setDate(`${year}-${month}-${day}`);
      } else {
        setDate(new Date().toISOString().split('T')[0]);
      }
    }
    setErrors({});
  }, [editingExpense, isOpen, defaultDate]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!description.trim()) {
      newErrors.description = 'Please enter a description';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    if (!date) {
      newErrors.date = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create date in UTC to avoid timezone conversion issues
      const [year, month, day] = date.split('-').map(Number);
      const dateObj = new Date(Date.UTC(year, month - 1, day)); // Create in UTC, month is 0-indexed
      
      const expenseData = {
        amount: parseFloat(amount),
        comments: description.trim(),
        category,
        paymentMethod,
        date: dateObj.toISOString(),
      };

      if (editingExpense && onUpdateExpense) {
        await onUpdateExpense(editingExpense.id, expenseData);
      } else {
        await onAddExpense(expenseData);
      }

      // Reset form
      setAmount('');
      setDescription('');
      setCategory('');
      setPaymentMethod('card');
      setDate(new Date().toISOString().split('T')[0]);
      setErrors({});
      onClose();
    } catch (error) {
      console.error(`Failed to ${editingExpense ? 'update' : 'add'} expense:`, error);
      // Error is handled by parent component via toast
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="mx-4 w-full max-w-md sm:mx-auto bg-card border-0 shadow-large">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-foreground flex items-center gap-2">
              <span className="text-primary font-bold">{currency.symbol}</span>
              Amount ({currency.code})
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) {
                  setErrors(prev => ({ ...prev, amount: '' }));
                }
              }}
              className={`text-lg font-semibold focus:ring-primary focus:border-primary transition-colors ${
                errors.amount ? 'border-destructive' : ''
              }`}
              disabled={loading}
              required
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="What did you spend on?"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) {
                  setErrors(prev => ({ ...prev, description: '' }));
                }
              }}
              className={`resize-none focus:ring-primary focus:border-primary transition-colors ${
                errors.description ? 'border-destructive' : ''
              }`}
              rows={3}
              disabled={loading}
              required
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              Category
            </Label>
            <Select 
              value={category} 
              onValueChange={(value) => {
                setCategory(value);
                if (errors.category) {
                  setErrors(prev => ({ ...prev, category: '' }));
                }
              }}
              disabled={loading}
              required
            >
              <SelectTrigger className={`focus:ring-primary focus:border-primary transition-colors ${
                errors.category ? 'border-destructive' : ''
              }`}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem 
                    key={cat.id} 
                    value={cat.id} 
                    className="focus:bg-primary/10 focus:text-foreground hover:bg-primary/10 hover:text-foreground data-[highlighted]:bg-primary/10 data-[highlighted]:text-foreground"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: `hsl(var(--${cat.color}))` }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod" className="text-sm font-medium text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment Method
            </Label>
            <Select 
              value={paymentMethod} 
              onValueChange={(value: 'card' | 'cash' | 'account' | 'digital') => setPaymentMethod(value)}
              disabled={loading}
              required
            >
              <SelectTrigger className="focus:ring-primary focus:border-primary transition-colors">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card" className="focus:bg-primary/10 focus:text-foreground hover:bg-primary/10 hover:text-foreground data-[highlighted]:bg-primary/10 data-[highlighted]:text-foreground">
                  <div className="flex items-center gap-3">
                    <span>💳</span>
                    Credit/Debit Card
                  </div>
                </SelectItem>
                <SelectItem value="cash" className="focus:bg-primary/10 focus:text-foreground hover:bg-primary/10 hover:text-foreground data-[highlighted]:bg-primary/10 data-[highlighted]:text-foreground">
                  <div className="flex items-center gap-3">
                    <span>💵</span>
                    Cash
                  </div>
                </SelectItem>
                <SelectItem value="account" className="focus:bg-primary/10 focus:text-foreground hover:bg-primary/10 hover:text-foreground data-[highlighted]:bg-primary/10 data-[highlighted]:text-foreground">
                  <div className="flex items-center gap-3">
                    <span>🏦</span>
                    Bank Account
                  </div>
                </SelectItem>
                <SelectItem value="digital" className="focus:bg-primary/10 focus:text-foreground hover:bg-primary/10 hover:text-foreground data-[highlighted]:bg-primary/10 data-[highlighted]:text-foreground">
                  <div className="flex items-center gap-3">
                    <span>📱</span>
                    Digital Wallet
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) {
                  setErrors(prev => ({ ...prev, date: '' }));
                }
              }}
              className={`focus:ring-primary focus:border-primary transition-colors ${
                errors.date ? 'border-destructive' : ''
              }`}
              disabled={loading}
              required
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 transition-all duration-200 hover:scale-105"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {editingExpense ? 'Updating...' : 'Adding...'}
                </div>
              ) : (
                editingExpense ? 'Update Expense' : 'Add Expense'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};