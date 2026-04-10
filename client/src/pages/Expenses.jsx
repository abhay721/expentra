import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MdAdd, MdDelete, MdEdit, MdOutlineReceiptLong } from 'react-icons/md';
import { AuthContext, API } from '../context/AuthContext';
import CategoryIcon from '../utils/CategoryIcon';
import { detectCategory } from '../utils/categoryDetector';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Expenses = () => {
    const { user } = useContext(AuthContext);

    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const today = new Date();
    const [filterMonth, setFilterMonth] = useState(today.getMonth() + 1);
    const [filterYear, setFilterYear] = useState(today.getFullYear());
    const [filterCategory, setFilterCategory] = useState('');

    const defaultForm = { title: '', amount: '', category: '', note: '', date: '', paymentMethod: 'cash', recurring: false };
    const [formData, setFormData] = useState(defaultForm);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [expRes, catRes] = await Promise.all([
                axios.get(`${API}/expenses?month=${filterMonth}&year=${filterYear}${filterCategory ? `&category=${filterCategory}` : ''}`),
                axios.get(`${API}/categories`)
            ]);
            setExpenses(expRes.data);
            const expCats = catRes.data.filter(c => c.type === 'expense' && c.isActive !== false);
            setCategories(expCats);
            if (!formData.category) {
                setFormData(prev => ({ ...prev, category: expCats[0]?.name || 'Other' }));
            }
        } catch (error) {
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filterMonth, filterYear, filterCategory]);

    const openAdd = () => {
        setEditingId(null);
        setFormData({
            title: '', amount: '',
            category: categories[0]?.name || 'Other',
            note: '',
            date: new Date().toISOString().split('T')[0],
            paymentMethod: 'cash',
            recurring: false
        });
        setShowModal(true);
    };

    const openEdit = (expense) => {
        setEditingId(expense._id);
        setFormData({
            title: expense.title || '',
            amount: expense.amount,
            category: expense.category,
            note: expense.note || '',
            date: expense.date ? expense.date.substring(0, 10) : '',
            paymentMethod: expense.paymentMethod || 'cash',
            recurring: expense.recurring || false,
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${API}/expenses/${editingId}`, formData);
                toast.success('Expense updated');
            } else {
                await axios.post(`${API}/expenses`, formData);
                toast.success('Expense added');
            }
            setShowModal(false);
            setEditingId(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving expense');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this expense?')) return;
        try {
            await axios.delete(`${API}/expenses/${id}`);
            setExpenses(prev => prev.filter(e => e._id !== id));
            toast.success('Expense deleted');
        } catch (error) {
            toast.error('Failed to delete expense');
        }
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        const detected = detectCategory(title, categories);
        setFormData(prev => ({ ...prev, title: title, category: detected }));
    };

    const getDisplayIcon = (expense) => {
        const lowerTitle = (expense.title || '').toLowerCase();
        for (const cat of categories) {
            if (cat.keywords?.length > 0 && cat.keywords.some(k => lowerTitle.includes(k.toLowerCase()))) {
                return cat.icon;
            }
        }
        return categories.find(c => c.name === expense.category)?.icon;
    };

    const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-28 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {MONTHS[filterMonth - 1]} {filterYear}
                    </p>
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                    <select
                        value={filterMonth}
                        onChange={e => setFilterMonth(Number(e.target.value))}
                        className="border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {MONTHS.map((m, i) => (
                            <option key={m} value={i + 1}>{m}</option>
                        ))}
                    </select>

                    <select
                        value={filterYear}
                        onChange={e => setFilterYear(Number(e.target.value))}
                        className="border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {[0, 1, 2].map(o => {
                            const y = today.getFullYear() - o;
                            return <option key={y} value={y}>{y}</option>;
                        })}
                    </select>

                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c._id} value={c.name}>{c.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={openAdd}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                        <MdAdd className="text-lg" /> Add Expense
                    </button>
                </div>
            </div>

            {/*  Summary Card */}
            <div className="bg-blue-600 rounded-lg p-5 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-white/10 rounded-lg p-3">
                        <MdOutlineReceiptLong className="text-2xl text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-blue-100">
                            Total Expenses — {MONTHS[filterMonth - 1]} {filterYear}
                        </p>
                        <p className="text-2xl font-bold text-white mt-1">₹{totalExpense.toLocaleString()}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-white">{expenses.length}</p>
                    <p className="text-xs text-blue-100 mt-1">Entries</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {expenses.map((expense) => (
                                <tr key={expense._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(expense.date).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                        <div className="flex flex-col">
                                            <span>{expense.title}</span>
                                            {expense.note && (
                                                <span className="text-xs text-gray-500 font-normal mt-0.5">{expense.note}</span>
                                            )}
                                            {expense.recurring && (
                                                <span className="text-xs text-blue-600 font-medium mt-0.5">🔁 Recurring</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2.5 py-1 inline-flex items-center gap-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                            <CategoryIcon iconName={getDisplayIcon(expense)} className="w-4 h-4" />
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                                        ₹{Number(expense.amount).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => openEdit(expense)}
                                            className="text-blue-600 hover:text-blue-800 mr-3 transition"
                                            title="Edit"
                                        >
                                            <MdEdit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(expense._id)}
                                            className="text-red-500 hover:text-red-700 transition"
                                            title="Delete"
                                        >
                                            <MdDelete className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {expenses.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <p className="text-gray-600 font-medium">
                                            No expenses for {MONTHS[filterMonth - 1]} {filterYear}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Click "Add Expense" to record your first entry.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-screen overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <MdOutlineReceiptLong className="text-white text-xl" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingId ? 'Edit Expense' : 'Record New Expense'}
                            </h2>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text" required
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    placeholder="e.g. Tea, Uber, Rent"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                                    Amount (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number" step="0.01" required min="0"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1"> Category (Auto-detected)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.category}
                                        disabled
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CategoryIcon
                                            iconName={categories.find(c => c.name === formData.category)?.icon || 'Category'}
                                            className="text-blue-600 w-4 h-4"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Note */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                                    Note <span className="text-gray-500 text-xs font-normal normal-case">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.note}
                                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                                    placeholder="Any extra details..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Recurring toggle */}
                            <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="recurring"
                                    checked={formData.recurring}
                                    onChange={e => setFormData({ ...formData, recurring: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                                />
                                <label htmlFor="recurring" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                    🔁 Mark as Recurring
                                </label>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setEditingId(null); }}
                                    className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    {editingId ? 'Update Expense' : 'Save Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;