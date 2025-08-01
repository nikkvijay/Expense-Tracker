import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Edit2,
  Trash2,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  getTotalIncome,
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
  type Income,
  type IncomeInput,
} from "@/api";
import { toast } from "sonner";

interface IncomeTrackerProps {
  totalSpent: number;
  onIncomeChange?: (income: number) => void;
  refreshTrigger?: number; // Add this to trigger refresh from parent
}

const INCOME_SOURCES = [
  { id: "salary", name: "Salary", icon: "💼" },
  { id: "freelance", name: "Freelance", icon: "💻" },
  { id: "investment", name: "Investment", icon: "📈" },
  { id: "business", name: "Business", icon: "🏢" },
  { id: "other", name: "Other", icon: "💰" },
];

export const IncomeTracker: React.FC<IncomeTrackerProps> = ({
  totalSpent,
  onIncomeChange,
  refreshTrigger,
}) => {
  const { formatCurrency } = useCurrency();
  const [totalIncome, setTotalIncome] = useState(0);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<IncomeInput>({
    source: "salary",
    amount: 0,
    description: "",
    isRecurring: true,
    frequency: "monthly",
  });

  // Load income data
  useEffect(() => {
    loadIncomeData();
  }, []);

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      loadIncomeData();
    }
  }, [refreshTrigger]);

  const loadIncomeData = async () => {
    try {
      setLoading(true);
      const currentDate = new Date();
      const [totalData, incomesData] = await Promise.all([
        getTotalIncome(currentDate.getMonth() + 1, currentDate.getFullYear()),
        getIncomes(),
      ]);

      setTotalIncome(totalData.total);
      setIncomes(incomesData);

      if (onIncomeChange) {
        onIncomeChange(totalData.total);
      }
    } catch (error) {
      console.error("Failed to load income data:", error);
      toast.error("Failed to load income data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || formData.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);

      if (editingIncome) {
        await updateIncome(editingIncome.id, formData);
        toast.success("Income updated successfully");
      } else {
        await createIncome(formData);
        toast.success("Income added successfully");
      }

      await loadIncomeData();
      handleCloseForm();
    } catch (error) {
      console.error("Failed to save income:", error);
      toast.error("Failed to save income");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setFormData({
      source: income.source,
      amount: income.amount,
      description: income.description || "",
      isRecurring: income.isRecurring,
      frequency: income.frequency,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteIncome(id);
      toast.success("Income deleted successfully");
      await loadIncomeData();
    } catch (error) {
      console.error("Failed to delete income:", error);
      toast.error("Failed to delete income");
    }
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingIncome(null);
    setFormData({
      source: "salary",
      amount: 0,
      description: "",
      isRecurring: true,
      frequency: "monthly",
    });
  };

  const netAmount = totalIncome - totalSpent;
  const savingsRate = totalIncome > 0 ? (netAmount / totalIncome) * 100 : 0;

  return (
    <Card className="p-4 sm:p-6 bg-gradient-card border-0 shadow-medium animate-slide-up">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">
              Income Tracker
            </h3>
            <p className="text-sm text-muted-foreground">
              Manage your income sources and track financial health
            </p>
          </div>

          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingIncome ? "Edit Income" : "Add New Income"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="source">Income Source</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({ ...prev, source: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INCOME_SOURCES.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.icon} {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="e.g., Monthly salary, Freelance project"
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Saving..." : editingIncome ? "Update" : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseForm}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Income Sources List */}
        {incomes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">
              Income Sources
            </h4>
            <div className="space-y-2">
              {incomes.slice(0, 3).map((income) => {
                const source = INCOME_SOURCES.find(
                  (s) => s.id === income.source
                );
                return (
                  <div
                    key={income.id}
                    className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{source?.icon || "💰"}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {source?.name || income.source}
                        </p>
                        {income.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {income.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-success">
                        {formatCurrency(income.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(income)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(income.id)}
                        className="h-8 w-8 p-0 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
