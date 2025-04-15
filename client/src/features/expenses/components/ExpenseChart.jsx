import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/utils/formatCurrency';

const COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];

const ExpenseChart = ({ distribution }) => {
    const formatData = distribution.map((item) => ({
        name: item._id,
        value: item.total
    }));

    const totalExpenses = distribution.reduce((sum, item) => sum + item.total, 0);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Expense Distribution</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <div className="w-full md:w-1/2" style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={formatData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {formatData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => [formatCurrency(value), 'Amount']}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2">
                    <h3 className="text-lg font-semibold mb-2">Summary</h3>
                    <div className="space-y-2">
                        <p className="text-gray-700">Total Expenses: <span className="font-bold">{formatCurrency(totalExpenses)}</span></p>
                        <div className="border-t pt-2">
                            {distribution.map((item) => (
                                <div key={item._id} className="flex justify-between py-1">
                                    <span>{item._id}</span>
                                    <span className="font-medium">{formatCurrency(item.total)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseChart;