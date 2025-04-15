import {
    TrendingUp,
    TrendingDown,
    Calendar,
    DollarSign
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

const ExpenseStats = ({ expenses }) => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const thisMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.createdAt);
        return expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear;
    });

    const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const prevMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.createdAt);
        return expenseDate.getMonth() === prevMonth &&
            expenseDate.getFullYear() === prevMonthYear;
    });

    const prevMonthTotal = prevMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    const monthChange = prevMonthTotal !== 0
        ? ((thisMonthTotal - prevMonthTotal) / prevMonthTotal) * 100
        : 0;

    const highestExpense = expenses.length > 0
        ? expenses.reduce((highest, expense) =>
            expense.amount > highest.amount ? expense : highest
        )
        : null;

    const stats = [
        {
            title: "Total Expenses",
            value: formatCurrency(totalExpenses),
            icon: <DollarSign className="h-6 w-6 text-blue-500" />,
            color: "bg-blue-50 text-blue-500"
        },
        {
            title: "This Month",
            value: formatCurrency(thisMonthTotal),
            icon: <Calendar className="h-6 w-6 text-purple-500" />,
            color: "bg-purple-50 text-purple-500"
        },
        {
            title: "Monthly Change",
            value: `${monthChange.toFixed(1)}%`,
            icon: monthChange >= 0
                ? <TrendingUp className="h-6 w-6 text-red-500" />
                : <TrendingDown className="h-6 w-6 text-green-500" />,
            color: monthChange >= 0
                ? "bg-red-50 text-red-500"
                : "bg-green-50 text-green-500"
        },
        {
            title: "Highest Expense",
            value: highestExpense
                ? formatCurrency(highestExpense.amount)
                : "-",
            subtitle: highestExpense?.category || "",
            icon: <TrendingUp className="h-6 w-6 text-amber-500" />,
            color: "bg-amber-50 text-amber-500"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm">{stat.title}</p>
                            <p className="text-2xl font-bold mt-1">{stat.value}</p>
                            {stat.subtitle && (
                                <p className="text-gray-600 text-sm mt-1">{stat.subtitle}</p>
                            )}
                        </div>
                        <div className={`p-2 rounded-full ${stat.color}`}>
                            {stat.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ExpenseStats;