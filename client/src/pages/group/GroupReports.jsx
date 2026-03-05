import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { MdDownload, MdFilterList, MdOutlineReceiptLong, MdPerson } from 'react-icons/md';
const GroupReports = () => {
    const { selectedGroupId } = useContext(AuthContext);
    const [expenses, setExpenses] = useState([]);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterCategory, setFilterCategory] = useState('');
    const [filterPaidBy, setFilterPaidBy] = useState('');
    const [sortBy, setSortBy] = useState('date-desc');

    useEffect(() => {
        if (!selectedGroupId) return;

        const fetchData = async () => {
            try {
                const [expRes, grpRes] = await Promise.all([
                    api.get(`/group-expenses/${selectedGroupId}`),
                    api.get(`/groups/${selectedGroupId}`)
                ]);
                setExpenses(expRes.data);
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
        return <div className="p-8 text-center bg-white rounded-xl shadow mt-8">Please select a group first.</div>;
    }

    if (loading) return <div className="p-8">Loading reports...</div>;

    // Extract unique categories and members for filters
    const categories = [...new Set(expenses.map(exp => exp.category))];
    const members = groupData?.members || [];

    // Apply Filters & Sorting
    let filteredExpenses = expenses.filter(exp => {
        if (filterCategory && exp.category !== filterCategory) return false;
        if (filterPaidBy && exp.paidBy.user?.toString() !== filterPaidBy && exp.paidBy.name !== filterPaidBy) return false;
        return true;
    });

    filteredExpenses.sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
    });

    const totalFilteredAmount = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const handleDownloadCSV = () => {
        if (filteredExpenses.length === 0) return toast.info("No data to download");

        const headers = ["Date", "Description", "Category", "Amount", "Paid By"];
        const rows = filteredExpenses.map(exp => [
            format(new Date(exp.date), 'dd MMM yyyy'),
            `"${exp.title.replace(/"/g, '""')}"`,
            exp.category,
            exp.amount,
            `"${(exp.paidBy?.name || 'Unknown').replace(/"/g, '""')}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${groupData.name.replace(/\s+/g, '_')}_expenses.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Expense Reports</h1>

                <button
                    onClick={handleDownloadCSV}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm"
                >
                    <MdDownload className="mr-2" /> Export to CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                <div className="w-full md:w-1/3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                        <MdFilterList className="mr-1" /> Category
                    </label>
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full md:w-1/3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                        <MdPerson className="mr-1" /> Paid By
                    </label>
                    <select
                        value={filterPaidBy}
                        onChange={e => setFilterPaidBy(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
                    >
                        <option value="">Anyone</option>
                        {members.map(m => (
                            <option key={m.user || m.name} value={m.user || m.name}>{m.name}</option>
                        ))}
                    </select>
                </div>

                <div className="w-full md:w-1/3">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort By</label>
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
                    >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="amount-desc">Amount (High to Low)</option>
                        <option value="amount-asc">Amount (Low to High)</option>
                    </select>
                </div>
            </div>

            {/* Report Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-sm">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 flex items-center">
                        <MdOutlineReceiptLong className="mr-2 text-indigo-500" />
                        Filtered Results ({filteredExpenses.length})
                    </h3>
                    <div className="font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                        Total: ₹{totalFilteredAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                </div>

                {filteredExpenses.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No expenses match your filters.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-medium">Date</th>
                                    <th className="p-4 font-medium">Description</th>
                                    <th className="p-4 font-medium">Category</th>
                                    <th className="p-4 font-medium">Paid By</th>
                                    <th className="p-4 font-medium text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredExpenses.map((exp) => (
                                    <tr key={exp._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-600 whitespace-nowrap">
                                            {format(new Date(exp.date), 'dd MMM yyyy')}
                                        </td>
                                        <td className="p-4">
                                            <p className="font-medium text-gray-900">{exp.title}</p>
                                            {exp.note && <p className="text-xs text-gray-500 truncate mt-0.5 max-w-xs">{exp.note}</p>}
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center text-gray-700 font-medium">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs mr-2 font-bold shrink-0">
                                                    {(exp.paidBy?.name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                {exp.paidBy?.name || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-bold text-gray-900 whitespace-nowrap">
                                            ₹{exp.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupReports;
