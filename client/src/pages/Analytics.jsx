import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { toast } from 'sonner';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';
import { getExpenses, getDistribution } from '@/api/api';
import { formatCurrency } from '@/utils/formatCurrency';

const Analytics = () => {
    const [expenses, setExpenses] = useState([]);
    const [distribution, setDistribution] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [expensesData, distributionData] = await Promise.all([
                getExpenses(),
                getDistribution(),
            ]);
            setExpenses(expensesData);
            setDistribution(distributionData);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch analytics data');
        } finally {
            setLoading(false);
        }
    };

    const getMonthlyData = () => {
        const monthData = {};

        expenses.forEach(expense => {
            const date = new Date(expense.createdAt);
            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

            if (monthData[monthYear]) {
                monthData[monthYear] += expense.amount;
            } else {
                monthData[monthYear] = expense.amount;
            }
        });

        return Object.entries(monthData)
            .map(([month, amount]) => ({
                month,
                amount: parseFloat(amount.toFixed(2))
            }))
            .sort((a, b) => {
                const [monthA, yearA] = a.month.split('/');
                const [monthB, yearB] = b.month.split('/');
                return new Date(parseInt(yearA), parseInt(monthA) - 1).getTime() -
                    new Date(parseInt(yearB), parseInt(monthB) - 1).getTime();
            });
    };

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

    const categoryData = distribution.map(item => ({
        category: item._id,
        amount: item.total
    }));

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto p-4 max-w-7xl">
                <h1 className="text-3xl font-bold my-6 text-gray-800">Expense Analytics</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Total Expenses</h3>
                        <p className="text-3xl font-bold text-expense-primary">{formatCurrency(totalExpenses)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Number of Expenses</h3>
                        <p className="text-3xl font-bold text-expense-primary">{expenses.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-2">Average Expense</h3>
                        <p className="text-3xl font-bold text-expense-primary">{formatCurrency(averageExpense)}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Expenses by Category</h2>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                                <Legend />
                                <Bar dataKey="amount" fill="#6366f1" name="Amount" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Monthly Expense Trend</h2>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getMonthlyData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#6366f1"
                                    activeDot={{ r: 8 }}
                                    name="Monthly Total"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;