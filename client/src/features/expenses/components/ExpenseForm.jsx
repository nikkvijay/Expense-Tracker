import { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import { toast } from 'sonner';
import { PlusCircle, Save, X } from 'lucide-react';

const ExpenseForm = ({ onSubmit, initialData = {}, onCancel }) => {
    const [category, setCategory] = useState(initialData.category || '');
    const [amount, setAmount] = useState(initialData.amount?.toString() || '');
    const [comments, setComments] = useState(initialData.comments || '');

    useEffect(() => {
        setCategory(initialData.category || '');
        setAmount(initialData.amount?.toString() || '');
        setComments(initialData.comments || '');
    }, [initialData]);

    const categories = [
        'Current',
        'Groceries',
        'Utilities',
        'Rent',
        'Transportation',
        'Entertainment',
        'Healthcare',
        'Dining',
        'Other'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!category) {
            toast.error("Category is required");
            return;
        }
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        const formData = {
            category,
            amount: Number(parseFloat(amount).toFixed(2)),
            comments
        };
        console.log('Submitting form data:', formData);
        onSubmit(formData);
        if (!initialData._id) {
            setCategory('');
            setAmount('');
            setComments('');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
                {initialData._id ? 'Update Expense' : 'Add New Expense'}
            </h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        >
                            <option value="" disabled>Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                            Amount
                        </label>
                        <input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                            Comments
                        </label>
                        <input
                            id="comments"
                            placeholder="Optional details about this expense"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="flex items-end space-x-2">
                        <Button
                            type="submit"
                            variant={initialData._id ? "success" : "primary"}
                            className="flex items-center"
                        >
                            {initialData._id ? (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Update
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Add Expense
                                </>
                            )}
                        </Button>
                        {initialData._id && (
                            <Button
                                type="button"
                                variant="secondary"
                                className="flex items-center"
                                onClick={onCancel}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ExpenseForm;