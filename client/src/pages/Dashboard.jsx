import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import ExpenseForm from '@/features/expenses/components/ExpenseForm';
import ExpenseTable from '@/features/expenses/components/ExpenseTable';
import ExpenseChart from '@/features/expenses/components/ExpenseChart';
import ExpenseStats from '@/features/expenses/components/ExpenseStats';
import { toast } from 'sonner';
import {
    createExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
    getDistribution,
} from '@/api/api';

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [distribution, setDistribution] = useState([]);
    const [editData, setEditData] = useState(null);
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
            console.error('Fetch error:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data) => {
        console.log('Received submit data:', data);
        if (!data || typeof data !== 'object' || !data.category || !data.amount) {
            console.error('Invalid submit data:', data);
            toast.error('Invalid form data');
            return;
        }
        try {
            if (editData) {
                if (!editData._id || typeof editData._id !== 'string') {
                    throw new Error('Invalid expense ID for update');
                }
                await updateExpense(editData._id, data);
                setEditData(null);
                toast.success('Expense updated successfully');
            } else {
                await createExpense(data);
                toast.success('Expense added successfully');
            }
            fetchData();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || (editData ? 'Failed to update expense' : 'Failed to add expense'));
        }
    };

    const handleEdit = (expense) => {
        setEditData(expense);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        console.log(`Handling delete for expense ID: ${id}`);
        if (typeof id !== 'string' || !id) {
            console.error('Invalid expense ID:', id);
            toast.error('Invalid expense ID');
            return;
        }
        try {
            await deleteExpense(id);
            toast.success('Expense deleted successfully');
            fetchData();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete expense');
        }
    };

    const handleCancel = () => {
        setEditData(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto px-9 py-5">
                <h1 className="text-3xl font-bold my-6 text-gray-800">Dashboard</h1>
                <ExpenseStats expenses={expenses} />
                <ExpenseForm
                    onSubmit={handleSubmit}
                    initialData={editData || {}}
                    onCancel={handleCancel}
                />
                <ExpenseTable
                    expenses={expenses}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
                {distribution.length > 0 && (
                    <ExpenseChart distribution={distribution} />
                )}
            </div>
        </div>
    );
};

export default Dashboard;