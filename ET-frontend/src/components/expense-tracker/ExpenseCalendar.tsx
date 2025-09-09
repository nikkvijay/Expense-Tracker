import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2 } from "lucide-react";
import { type Expense } from "@/api";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ExpenseCalendarProps {
  expenses: Expense[];
  categories: { id: string; name: string; color: string }[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
  onAddExpense: (date?: Date) => void;
}

export const ExpenseCalendar: React.FC<ExpenseCalendarProps> = ({
  expenses,
  categories,
  onDeleteExpense,
  onEditExpense,
  onAddExpense,
}) => {
  const { formatCurrency } = useCurrency();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getCategoryInfo = (categoryId: string) => {
    return (
      categories.find((cat) => cat.id === categoryId) ||
      categories[categories.length - 1]
    );
  };

  const getPaymentMethodInfo = (method: string) => {
    const methods = {
      card: { icon: "💳", name: "Card" },
      cash: { icon: "💵", name: "Cash" },
      account: { icon: "🏦", name: "Bank" },
      digital: { icon: "📱", name: "Digital" },
    };
    return methods[method as keyof typeof methods] || methods.card;
  };

  // Get current month's first day and last day
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays = [];

  // Previous month days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(firstDayOfMonth);
    prevDate.setDate(prevDate.getDate() - (i + 1));
    calendarDays.push({ date: prevDate, isCurrentMonth: false });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    calendarDays.push({ date, isCurrentMonth: true });
  }

  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    const nextDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      day
    );
    calendarDays.push({ date: nextDate, isCurrentMonth: false });
  }

  // Get expenses for a specific date
  const getExpensesForDate = (date: Date) => {
    const matchingExpenses = expenses.filter((expense) => {
      // Handle different date formats that might come from API
      let expenseDate;
      if (typeof expense.date === "string") {
        // If it's a string, parse it properly
        expenseDate = new Date(expense.date);
      } else {
        expenseDate = new Date(expense.date);
      }

      // Ensure we have a valid date
      if (isNaN(expenseDate.getTime())) {
        console.warn("Invalid expense date:", expense.date);
        return false;
      }

      // Compare only year, month, and day (ignore time)
      const expenseYear = expenseDate.getFullYear();
      const expenseMonth = expenseDate.getMonth();
      const expenseDay = expenseDate.getDate();

      const targetYear = date.getFullYear();
      const targetMonth = date.getMonth();
      const targetDay = date.getDate();

      const matches =
        expenseYear === targetYear &&
        expenseMonth === targetMonth &&
        expenseDay === targetDay;

      return matches;
    });

    return matchingExpenses;
  };

  // Get total amount for a date
  const getTotalForDate = (date: Date) => {
    return getExpensesForDate(date).reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
    setSelectedDate(null);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const selectedDateExpenses = selectedDate
    ? getExpensesForDate(selectedDate)
    : [];

  return (
    <Card className="p-4 sm:p-6 bg-gradient-card shadow-medium">
      <div className="space-y-6">
        {/* Calendar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground">
            Expense Calendar
          </h3>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm sm:text-base font-medium min-w-[100px] sm:min-w-[120px] text-center px-2">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-1 sm:p-2 text-xs font-medium text-muted-foreground text-center"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((dayInfo, index) => {
            const dayExpenses = getExpensesForDate(dayInfo.date);
            const totalAmount = getTotalForDate(dayInfo.date);
            const isSelected =
              selectedDate &&
              selectedDate.getFullYear() === dayInfo.date.getFullYear() &&
              selectedDate.getMonth() === dayInfo.date.getMonth() &&
              selectedDate.getDate() === dayInfo.date.getDate();

            const today = new Date();
            const isToday =
              dayInfo.date.getFullYear() === today.getFullYear() &&
              dayInfo.date.getMonth() === today.getMonth() &&
              dayInfo.date.getDate() === today.getDate();

            return (
              <div
                key={index}
                onClick={() =>
                  dayInfo.isCurrentMonth && handleDateClick(dayInfo.date)
                }
                className={`
                  p-1 sm:p-2 min-h-[50px] sm:min-h-[60px] lg:min-h-[80px] bg-card/50 rounded-md sm:rounded-lg cursor-pointer transition-all duration-200
                  ${dayInfo.isCurrentMonth ? "hover:bg-surface" : "opacity-50"}
                  ${isSelected ? "bg-primary/20" : ""}
                  ${isToday ? "ring-1 sm:ring-2 ring-primary/50" : ""}
                `}
              >
                <div className="flex flex-col h-full">
                  <span
                    className={`text-xs font-medium ${
                      dayInfo.isCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {dayInfo.date.getDate()}
                  </span>

                  {dayExpenses.length > 0 && (
                    <div className="flex-1 mt-1 space-y-1">
                      <div className="text-xs font-semibold text-primary truncate">
                        {formatCurrency(totalAmount)}
                      </div>
                      <div className="space-y-1 hidden sm:block">
                        {dayExpenses.slice(0, 2).map((expense, idx) => {
                          const categoryInfo = getCategoryInfo(
                            expense.category
                          );
                          return (
                            <div key={idx} className="flex items-center gap-1">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: `hsl(var(--${categoryInfo.color}))`,
                                }}
                              />
                              <span className="text-xs text-muted-foreground truncate">
                                {expense.description || "No desc"}
                              </span>
                            </div>
                          );
                        })}
                        {dayExpenses.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayExpenses.length - 2} more
                          </div>
                        )}
                      </div>
                      {/* Mobile: Show only dot indicators */}
                      <div className="sm:hidden flex flex-wrap gap-1 mt-1">
                        {dayExpenses.slice(0, 3).map((expense, idx) => {
                          const categoryInfo = getCategoryInfo(
                            expense.category
                          );
                          return (
                            <div
                              key={idx}
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: `hsl(var(--${categoryInfo.color}))`,
                              }}
                              title={expense.description || "No description"}
                            />
                          );
                        })}
                        {dayExpenses.length > 3 && (
                          <div className="text-xs text-muted-foreground font-bold">
                            +
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h4>
              <Button
                size="sm"
                onClick={() => onAddExpense(selectedDate)}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span className="sm:inline">Add Expense</span>
              </Button>
            </div>

            {selectedDateExpenses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No expenses for this date
                </p>
                <Button size="sm" onClick={() => onAddExpense(selectedDate)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Expense
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateExpenses.map((expense) => {
                  const categoryInfo = getCategoryInfo(expense.category);
                  return (
                    <div
                      key={expense.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-surface rounded-lg gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: `hsl(var(--${categoryInfo.color}))`,
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {expense.description ||
                              expense.comments ||
                              "No description"}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <p className="text-xs text-muted-foreground">
                              {categoryInfo.name}
                            </p>
                            {expense.paymentMethod && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span>
                                  {
                                    getPaymentMethodInfo(expense.paymentMethod)
                                      .icon
                                  }
                                </span>
                                <span>
                                  {
                                    getPaymentMethodInfo(expense.paymentMethod)
                                      .name
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                        <span className="text-sm font-semibold text-foreground">
                          {formatCurrency(expense.amount)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditExpense(expense)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteExpense(expense.id)}
                            className="h-8 w-8 p-0 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="text-right pt-2">
                  <span className="text-base font-semibold text-foreground">
                    Total:{" "}
                    {formatCurrency(
                      selectedDateExpenses.reduce(
                        (sum, expense) => sum + expense.amount,
                        0
                      )
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
