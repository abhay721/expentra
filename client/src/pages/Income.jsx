import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API } from '../context/AuthContext';
import { MdAdd, MdDelete, MdEdit, MdTrendingUp } from 'react-icons/md';
import CategoryIcon from '../utils/CategoryIcon';
import { detectCategory } from '../utils/categoryDetector';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Income = () => {
    const [incomes, setIncomes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const today = new Date();
    const [filterMonth, setFilterMonth] = useState(today.getMonth() + 1);
    const [filterYear, setFilterYear] = useState(today.getFullYear());

    const defaultForm = { title: '', amount: '', category: '', note: '', date: '' };
    const [formData, setFormData] = useState(defaultForm);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [incRes, catRes] = await Promise.all([
                axios.get(`${API}/incomes?month=${filterMonth}&year=${filterYear}`),
                axios.get(`${API}/categories`)
            ]);
            setIncomes(incRes.data);
            const incomeCats = catRes.data.filter(c => c.type === 'income' && c.isActive !== false);
            setCategories(incomeCats);
            if (!formData.category && incomeCats.length > 0) {
                setFormData(prev => ({ ...prev, category: incomeCats[0].name }));
            }
        } catch (error) {
            toast.error('Failed to load income data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filterMonth, filterYear]);

    const openAdd = () => {
        setEditingId(null);
        setFormData({
            title: '',
            amount: '',
            category: categories[0]?.name || 'Other',
            note: '',
            date: new Date().toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    const openEdit = (income) => {
        setEditingId(income._id);
        setFormData({
            title: income.title || income.description || '',
            amount: income.amount,
            category: income.category,
            note: income.note || '',
            date: income.date ? income.date.substring(0, 10) : ''
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const sendData = {
                title: formData.title,
                amount: formData.amount,
                category: formData.category,
                description: formData.note || formData.title,
                date: formData.date,
            };
            if (editingId) {
                await axios.put(`${API}/incomes/${editingId}`, sendData);
                toast.success('Income updated successfully');
            } else {
                await axios.post(`${API}/incomes`, sendData);
                toast.success('Income added successfully');
            }
            setShowModal(false);
            setEditingId(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving income');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this income entry?')) return;
        try {
            await axios.delete(`${API}/incomes/${id}`);
            setIncomes(prev => prev.filter(i => i._id !== id));
            toast.success('Income deleted');
        } catch (error) {
            toast.error('Failed to delete income');
        }
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        const detected = detectCategory(title, categories);
        setFormData(prev => ({ ...prev, title: title, category: detected }));
    };

    // Get matched category for display in table
    const getDisplayCategory = (income) => {
        const lowerTitle = (income.title || income.description || '').toLowerCase();
        const matched = categories.find(cat =>
            cat.keywords?.some(k => lowerTitle.includes(k.toLowerCase()))
        );
        return matched || categories.find(c => c.name === income.category) || { name: income.category, icon: 'Other' };
    };

    const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);

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
                    <h1 className="text-2xl font-bold text-gray-900">Income Log</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {MONTHS[filterMonth - 1]} {filterYear}
                    </p>
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                    {/* Month filter */}
                    <select
                        value={filterMonth}
                        onChange={e => setFilterMonth(Number(e.target.value))}
                        className="border border-gray-300 bg-white text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {MONTHS.map((m, i) => (
                            <option key={m} value={i + 1}>{m}</option>
                        ))}
                    </select>

                    {/* Year filter */}
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

                    <button
                        onClick={openAdd}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                        <MdAdd className="text-lg" /> Record Income
                    </button>
                </div>
            </div>

            {/* Summary Card */}
            <div className="bg-blue-600 rounded-lg p-5 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-white/10 rounded-lg p-3">
                        <MdTrendingUp className="text-2xl text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-blue-100">
                            Total Income — {MONTHS[filterMonth - 1]} {filterYear}
                        </p>
                        <p className="text-2xl font-bold text-white mt-1">₹{totalIncome.toLocaleString()}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-white">{incomes.length}</p>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Source / Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {incomes.map((income) => (
                                <tr key={income._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {new Date(income.date).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                        <div className="flex flex-col">
                                            <span>{income.title || income.description}</span>
                                            {income.title && income.description && income.title !== income.description && (
                                                <span className="text-xs text-gray-500 font-normal mt-0.5">{income.description}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {(() => {
                                            const cat = getDisplayCategory(income);
                                            return (
                                                <span className="px-2.5 py-1 inline-flex items-center gap-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                                    <CategoryIcon iconName={cat.icon} className="w-4 h-4" />
                                                    {cat.name}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                        ₹{Number(income.amount).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => openEdit(income)}
                                            className="text-blue-600 hover:text-blue-800 mr-3 transition"
                                            title="Edit"
                                        >
                                            <MdEdit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(income._id)}
                                            className="text-red-500 hover:text-red-700 transition"
                                            title="Delete"
                                        >
                                            <MdDelete className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {incomes.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <p className="text-gray-600 font-medium">
                                            No entries for {MONTHS[filterMonth - 1]} {filterYear}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Click "Record Income" to add your first entry.
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
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        {/* Modal Header */}
                        <div className="flex items-center gap-3 mb-5">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <MdTrendingUp className="text-white text-xl" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editingId ? 'Edit Income Entry' : 'Log New Income'}
                            </h2>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    placeholder="e.g. Salary, Freelance, Rent Income"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                                    Amount (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                                    Category (Auto-detected)
                                </label>
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
                                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingId(null);
                                    }}
                                    className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    {editingId ? 'Update Income' : 'Add Income'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Income;