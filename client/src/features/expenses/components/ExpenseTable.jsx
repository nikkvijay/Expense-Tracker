import Button from '@/components/common/Button';
import { Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

const ExpenseTable = ({ expenses, onEdit, onDelete }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-2xl font-bold p-6 border-b">Expenses History</h2>
            {expenses.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                    No expenses found. Add one using the form above.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-4 font-semibold text-gray-700">Category</th>
                                <th className="p-4 font-semibold text-gray-700">Amount</th>
                                <th className="p-4 font-semibold text-gray-700">Created</th>
                                <th className="p-4 font-semibold text-gray-700">Updated</th>
                                <th className="p-4 font-semibold text-gray-700">Comments</th>
                                <th className="p-4 font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense) => (
                                <tr key={expense._id} className="border-t hover:bg-gray-50">
                                    <td className="p-4 font-medium">{expense.category}</td>
                                    <td className="p-4 text-expense-primary font-medium">
                                        {formatCurrency(expense.amount)}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {new Date(expense.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {new Date(expense.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-gray-700">{expense.comments || '-'}</td>
                                    <td className="p-4">
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="warning"
                                                size="sm"
                                                className="flex items-center"
                                                onClick={() => onEdit(expense)}
                                            >
                                                <Edit2 className="w-4 h-4 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="flex items-center bg-red-500"
                                                onClick={() => {
                                                    console.log(`Delete clicked for expense ID: ${expense._id}`);
                                                    onDelete(expense._id);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ExpenseTable;