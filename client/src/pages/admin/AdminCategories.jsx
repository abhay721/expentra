import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext, API } from '../../context/AuthContext';
import {
    MdAdd, MdDelete, MdEdit, MdToggleOn, MdToggleOff, MdCategory,
    MdClose, MdCheck, MdRefresh, MdSearch, MdFilterList,
    MdAttachMoney, MdTrendingUp, MdWarning
} from 'react-icons/md';
import CategoryIcon from '../../utils/CategoryIcon';

const AVAILABLE_ICONS = [
    // Essentials & Shopping
    'MdStore', 'MdShoppingCart', 'MdShoppingBag', 'MdLocalMall', 'MdStorefront', 'MdAddShoppingCart',
    // Food & Drink
    'MdRestaurant', 'MdLocalCafe', 'MdFastfood', 'MdLocalPizza', 'MdLocalBar', 'MdRestaurantMenu', 'MdBakeryDining', 'MdIcecream',
    // Transport & Travel
    'MdDirectionsCar', 'MdCommute', 'MdFlight', 'MdLocalGasStation', 'MdDirectionsBike', 'MdDirectionsBus', 'MdDirectionsSubway', 'MdDirectionsWalk', 'MdDirectionsBoat', 'MdTram',
    // Housing & Utilities
    'MdHome', 'MdFlashOn', 'MdCleaningServices', 'MdHandyman', 'MdWaterDrop', 'MdAir', 'MdLightbulb', 'MdPropane', 'MdSolarPower',
    // Finance & Work
    'MdAttachMoney', 'MdWork', 'MdPayments', 'MdAccountBalance', 'MdReceipt', 'MdSavings', 'MdPaid', 'MdMonetizationOn', 'MdCreditCard', 'MdAccountBalanceWallet',
    // Entertainment & Lifestyle
    'MdTheaterComedy', 'MdMovie', 'MdGamepad', 'MdMusicNote', 'MdSportsEsports', 'MdTv', 'MdLocalActivity', 'MdEvent', 'MdCameraAlt',
    // Health & Fitness
    'MdLocalHospital', 'MdFitnessCenter', 'MdSelfImprovement', 'MdMedicalServices', 'MdVaccines', 'MdSpa',
    // Education & Personal
    'MdSchool', 'MdPets', 'MdCake', 'MdCheckroom', 'MdPerson', 'MdGroup', 'MdElderly', 'MdChildCare',
    // Tech & Electronics
    'MdSmartphone', 'MdComputer', 'MdPhonelink', 'MdLaptop', 'MdWatch', 'MdHeadset', 'MdPrint', 'MdRouter',
    // Others
    'MdBuild', 'MdSecurity', 'MdCardGiftcard', 'MdSubscriptions', 'MdLandscape', 'MdPool', 'MdSmokingRooms', 'MdStyle', 'MdVolunteerActivism', 'MdPark'
];

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', type: 'expense', isActive: true, icon: 'MdCategory', keywords: '' });
    const [editId, setEditId] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [iconSearchTerm, setIconSearchTerm] = useState('');

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API}/admin/categories`);
            setCategories(res.data);
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await axios.delete(`${API}/admin/categories/${id}`);
                toast.success('Category deleted');
                fetchCategories();
            } catch (error) {
                toast.error('Failed to delete category');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...formData,
                keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k !== '')
            };

            if (editId) {
                await axios.put(`${API}/admin/categories/${editId}`, dataToSend);
                toast.success('Category updated successfully');
            } else {
                await axios.post(`${API}/admin/categories`, dataToSend);
                toast.success('Category created successfully');
            }
            setShowModal(false);
            setEditId(null);
            setFormData({ name: '', type: 'expense', isActive: true, icon: 'MdCategory', keywords: '' });
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving category');
        }
    };

    const openEdit = (category) => {
        setFormData({
            name: category.name,
            type: category.type,
            isActive: category.isActive,
            icon: category.icon || 'MdCategory',
            keywords: category.keywords ? category.keywords.join(', ') : ''
        });
        setEditId(category._id);
        setShowModal(true);
    };

    const handleToggleActive = async (category) => {
        try {
            await axios.put(`${API}/admin/categories/${category._id}`, {
                isActive: !category.isActive
            });
            toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'}`);
            fetchCategories();
        } catch (error) {
            toast.error('Failed to update category status');
        }
    };

    const filteredCategories = categories.filter(cat => {
        if (filterType !== 'all' && cat.type !== filterType) return false;
        if (searchTerm && !cat.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const expenseCount = categories.filter(c => c.type === 'expense' && c.isActive).length;
    const incomeCount = categories.filter(c => c.type === 'income' && c.isActive).length;
    const totalActive = categories.filter(c => c.isActive).length;

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <MdCategory className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
                        <p className="text-sm text-gray-600 mt-0.5">Manage expense and income categories</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setEditId(null);
                        setFormData({ name: '', type: 'expense', isActive: true, icon: 'MdCategory', keywords: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                    <MdAdd className="text-base" />
                    New Category
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600 uppercase">Total Categories</p>
                            <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MdCategory className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{totalActive} active</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600 uppercase">Expense Categories</p>
                            <p className="text-2xl font-bold text-red-600">{expenseCount}</p>
                        </div>
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <MdTrendingUp className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">For tracking spending</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600 uppercase">Income Categories</p>
                            <p className="text-2xl font-bold text-green-600">{incomeCount}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <MdAttachMoney className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">For tracking earnings</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition ${filterType === 'all'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterType('expense')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition ${filterType === 'expense'
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Expenses
                    </button>
                    <button
                        onClick={() => setFilterType('income')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition ${filterType === 'income'
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Income
                    </button>
                </div>
                <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-64"
                    />
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCategories.map((cat) => (
                    <div
                        key={cat._id}
                        className={`bg-white rounded-lg border shadow-sm ${cat.isActive ? 'border-gray-200' : 'border-gray-200 bg-gray-50'
                            }`}
                    >
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${cat.isActive
                                            ? cat.type === 'expense' ? 'bg-red-50' : 'bg-green-50'
                                            : 'bg-gray-100'
                                        }`}>
                                        <CategoryIcon
                                            iconName={cat.icon || 'MdCategory'}
                                            className={`w-6 h-6 ${cat.isActive
                                                    ? cat.type === 'expense' ? 'text-red-500' : 'text-green-500'
                                                    : 'text-gray-400'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold text-lg ${cat.isActive ? 'text-gray-900' : 'text-gray-500'
                                            }`}>
                                            {cat.name}
                                        </h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${cat.type === 'expense'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-green-100 text-green-700'
                                            }`}>
                                            {cat.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => openEdit(cat)}
                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                        title="Edit"
                                    >
                                        <MdEdit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat._id, cat.name)}
                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                                        title="Delete"
                                    >
                                        <MdDelete className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {cat.keywords && cat.keywords.length > 0 && (
                                <div className="mb-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {cat.keywords.slice(0, 3).map((kw, i) => (
                                            <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                {kw}
                                            </span>
                                        ))}
                                        {cat.keywords.length > 3 && (
                                            <span className="text-xs px-2 py-0.5 text-gray-500">
                                                +{cat.keywords.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="text-xs text-gray-500">
                                    {cat.keywords?.length || 0} keywords
                                </div>
                                <button
                                    onClick={() => handleToggleActive(cat)}
                                    className={`flex items-center gap-1 text-sm font-medium transition ${cat.isActive
                                            ? 'text-green-600 hover:text-green-700'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {cat.isActive ? (
                                        <>
                                            <MdToggleOn className="w-5 h-5" />
                                            <span className="text-xs">Active</span>
                                        </>
                                    ) : (
                                        <>
                                            <MdToggleOff className="w-5 h-5" />
                                            <span className="text-xs">Inactive</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCategories.length === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MdCategory className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No Categories Found</h3>
                    <p className="text-gray-600 mt-1">
                        {searchTerm ? 'Try a different search term' : 'Create your first category to get started'}
                    </p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {editId ? 'Edit Category' : 'Create New Category'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-gray-200 rounded transition text-gray-500 hover:text-gray-700"
                            >
                                <MdClose className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                            <div className="p-6 space-y-5 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Groceries, Salary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            value="expense"
                                            checked={formData.type === 'expense'}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-4 h-4 text-red-500 focus:ring-red-500"
                                        />
                                        <span className="text-sm text-gray-700">Expense</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            value="income"
                                            checked={formData.type === 'income'}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-4 h-4 text-green-500 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700">Income</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Select Icon <span className="text-red-500">*</span>
                                    </label>
                                    <a 
                                        href="https://react-icons.github.io/react-icons/icons/md" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        Browse More on React-Icons Website
                                    </a>
                                </div>
                                
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    {/* Icon Preview & Search */}
                                    <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 shadow-sm">
                                                <CategoryIcon iconName={formData.icon} className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="text-xs">
                                                <p className="font-semibold text-gray-900">Preview</p>
                                                <p className="text-gray-500 text-[10px] break-all">{formData.icon}</p>
                                            </div>
                                        </div>
                                        <div className="relative flex-1 max-w-[160px]">
                                            <MdSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search icons..."
                                                value={iconSearchTerm}
                                                onChange={(e) => setIconSearchTerm(e.target.value)}
                                                className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Icon Grid */}
                                    <div className="h-44 overflow-y-auto p-3 bg-white">
                                        {iconSearchTerm && !AVAILABLE_ICONS.some(icon => icon.toLowerCase() === iconSearchTerm.toLowerCase()) && (
                                            <div className="mb-3 px-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, icon: iconSearchTerm })}
                                                    className={`w-full py-2 px-3 rounded-lg flex items-center gap-3 transition-all ${
                                                        formData.icon === iconSearchTerm 
                                                            ? 'bg-blue-600 text-white shadow-md' 
                                                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                                    }`}
                                                >
                                                    <CategoryIcon iconName={iconSearchTerm} className="w-5 h-5" />
                                                    <span className="text-xs font-medium truncate">Use Custom: {iconSearchTerm}</span>
                                                </button>
                                                <div className="h-px bg-gray-100 my-3"></div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-6 gap-2">
                                            {AVAILABLE_ICONS.filter(icon => 
                                                icon.toLowerCase().includes(iconSearchTerm.toLowerCase())
                                            ).map((icon) => (
                                                <button
                                                    key={icon}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, icon });
                                                        setIconSearchTerm('');
                                                    }}
                                                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                                                        formData.icon === icon 
                                                            ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-100' 
                                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                    }`}
                                                    title={icon}
                                                >
                                                    <CategoryIcon iconName={icon} className="w-5 h-5" />
                                                </button>
                                            ))}
                                        </div>

                                        {AVAILABLE_ICONS.filter(icon => 
                                            icon.toLowerCase().includes(iconSearchTerm.toLowerCase())
                                        ).length === 0 && !iconSearchTerm && (
                                            <div className="text-center py-8 text-gray-500 text-xs">
                                                No icons found. Try searching.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Auto Keywords (comma separated)
                                </label>
                                <textarea
                                    value={formData.keywords}
                                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="e.g., grocery, supermarket, walmart"
                                    rows="3"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    If expense description contains these words, this category will be auto-selected.
                                </p>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                                />
                                <span className="text-sm text-gray-700">Active (Users can select this category)</span>
                            </label>
                            
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
                                >
                                    {editId ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;