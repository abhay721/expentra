import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
    MdDownload, MdFilterList, MdOutlineReceiptLong, MdPerson,
    MdGroup, MdCategory, MdDateRange, MdAttachMoney,
    MdReceipt, MdCompareArrows, MdInfoOutline, MdClear
} from 'react-icons/md';

const GroupReports = () => {
    const { selectedGroupId } = useContext(AuthContext);
    const [activities, setActivities] = useState([]);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [filterCategory, setFilterCategory] = useState('');
    const [filterPaidBy, setFilterPaidBy] = useState('');
    const [filterType, setFilterType] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');

    useEffect(() => {
        if (!selectedGroupId) return;

        const fetchData = async () => {
            try {
                const [expRes, grpRes] = await Promise.all([
                    axios.get(`${API}/group-expenses/${selectedGroupId}`),
                    axios.get(`${API}/groups/${selectedGroupId}`)
                ]);

                const rawExpenses = expRes.data;
                const transformedActivities = [];
                const settlementAggregator = {};

                rawExpenses.forEach(exp => {
                    transformedActivities.push({
                        id: exp._id,
                        type: 'expense',
                        title: exp.title,
                        amount: exp.amount,
                        date: exp.date,
                        category: exp.category || 'General',
                        paidBy: exp.paidBy.map(p => p.name).join(', '),
                        note: exp.note
                    });

                    if (exp.settlements && exp.settlements.length > 0) {
                        exp.settlements.forEach(s => {
                            if (s.reimbursementStatus === 'paid') {
                                const payDate = s.paymentDate || exp.date;
                                const dateStr = format(new Date(payDate), 'yyyy-MM-dd HH:mm');
                                const key = `${dateStr}_${s.from.name}_${s.to.name}`;

                                if (!settlementAggregator[key]) {
                                    settlementAggregator[key] = {
                                        id: `agg_s_${key}`,
                                        type: 'settlement',
                                        title: `${s.from.name} → ${s.to.name}`,
                                        amount: s.amount,
                                        date: payDate,
                                        category: 'Settlement',
                                        paidBy: s.from.name,
                                        note: `Method: ${s.paymentMethod || 'cash'}`
                                    };
                                } else {
                                    settlementAggregator[key].amount += s.amount;
                                }
                            }
                        });
                    }
                });

                Object.values(settlementAggregator).forEach(aggS => {
                    transformedActivities.push(aggS);
                });

                setActivities(transformedActivities);
                setGroupData(grpRes.data);
            } catch (error) {
                toast.error("Failed to load group reports");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedGroupId]);

    if (!selectedGroupId) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MdGroup className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">No Group Selected</h3>
                    <p className="text-gray-600 mt-2">Please select a group from the Groups menu first.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
                    <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
                </div>
            </div>
        );
    }

    const categories = [...new Set(activities.filter(a => a.type === 'expense').map(a => a.category))];
    const members = groupData?.members || [];

    let filteredActivities = activities.filter(act => {
        if (filterType && act.type !== filterType) return false;
        if (filterCategory && act.category !== filterCategory) return false;
        if (filterPaidBy && !act.paidBy.toLowerCase().includes(filterPaidBy.toLowerCase())) return false;
        return true;
    });

    filteredActivities.sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
    });

    const totalFilteredAmount = filteredActivities.reduce((sum, act) => sum + act.amount, 0);
    const expenseTotal = filteredActivities.filter(a => a.type === 'expense').reduce((sum, a) => sum + a.amount, 0);
    const settlementTotal = filteredActivities.filter(a => a.type === 'settlement').reduce((sum, a) => sum + a.amount, 0);

    const clearFilters = () => {
        setFilterCategory('');
        setFilterPaidBy('');
        setFilterType('');
        setSortBy('date-desc');
    };

    const hasActiveFilters = filterCategory || filterPaidBy || filterType;

    const handleDownloadCSV = () => {
        if (filteredActivities.length === 0) {
            toast.info("No data to download");
            return;
        }

        const headers = ["Date", "Type", "Description", "Category", "Amount", "Payer/From"];
        const rows = filteredActivities.map(act => [
            format(new Date(act.date), 'dd MMM yyyy'),
            act.type.toUpperCase(),
            `"${act.title.replace(/"/g, '""')}"`,
            act.category,
            act.amount,
            `"${act.paidBy.replace(/"/g, '""')}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${groupData.name.replace(/\s+/g, '_')}_financial_report.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Group Reports</h1>
                    <p className="text-gray-600 text-sm mt-1">{groupData?.name} • Financial activity</p>
                </div>
                <button
                    onClick={handleDownloadCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                    <MdDownload className="text-base" /> Export CSV
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600 uppercase">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900">₹{totalFilteredAmount.toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MdAttachMoney className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600 uppercase">Expenses</p>
                            <p className="text-2xl font-bold text-red-600">₹{expenseTotal.toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <MdReceipt className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-600 uppercase">Settlements</p>
                            <p className="text-2xl font-bold text-green-600">₹{settlementTotal.toLocaleString()}</p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <MdCompareArrows className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <MdFilterList className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Filters</h3>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition"
                        >
                            <MdClear className="text-sm" /> Clear all
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                        <select
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="">All Types</option>
                            <option value="expense">Expenses</option>
                            <option value="settlement">Settlements</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            disabled={filterType === 'settlement'}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Payer / From</label>
                        <select
                            value={filterPaidBy}
                            onChange={e => setFilterPaidBy(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="">Anyone</option>
                            {members.map(m => (
                                <option key={m.user || m.name} value={m.name}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="amount-desc">Amount (High to Low)</option>
                            <option value="amount-asc">Amount (Low to High)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{filteredActivities.length}</span> activities
                    {hasActiveFilters && <span className="text-blue-600"> (filtered)</span>}
                </p>
                <p className="text-sm font-medium text-blue-600">
                    Total: ₹{totalFilteredAmount.toLocaleString()}
                </p>
            </div>

            {/* Activities Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {filteredActivities.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <MdOutlineReceiptLong className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium">No activities match your filters</p>
                            <p className="text-sm text-gray-500 mt-1">Try adjusting your filter criteria</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">Date</th>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">Type</th>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">Description</th>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">Category</th>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">Payer/From</th>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredActivities.map((act) => (
                                    <tr key={act.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                            {format(new Date(act.date), 'dd MMM yyyy')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${act.type === 'expense'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}>
                                                {act.type === 'expense' ? <MdReceipt className="text-xs" /> : <MdCompareArrows className="text-xs" />}
                                                {act.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-gray-900">{act.title}</p>
                                            {act.note && (
                                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                    <MdInfoOutline className="text-xs" /> {act.note}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                                <MdCategory className="text-xs" />
                                                {act.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${act.paidBy.includes(',')
                                                        ? 'bg-purple-100 text-purple-600'
                                                        : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {act.paidBy.includes(',') ? 'M' : (act.paidBy.charAt(0) || 'U').toUpperCase()}
                                                </div>
                                                <span className="text-sm text-gray-700 truncate max-w-[120px]">{act.paidBy || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`text-sm font-bold ${act.type === 'expense' ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                ₹{act.amount.toLocaleString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupReports;