import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API } from '../context/AuthContext';
import {
    PieChart, Pie, Cell, Tooltip, Legend,
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { MdDownload, MdAttachMoney, MdTrendingUp, MdWarning, MdCategory, MdShowChart } from 'react-icons/md';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC489A', '#06B6D4', '#84CC16'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Reports = () => {
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [monthlyData, setMonthlyData] = useState(null);
    const [yearlyData, setYearlyData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const [monthRes, yearRes] = await Promise.all([
                axios.get(`${API}/reports/monthly?month=${selectedMonth}&year=${selectedYear}`),
                axios.get(`${API}/reports/yearly?year=${selectedYear}`)
            ]);
            setMonthlyData(monthRes.data);
            setYearlyData(yearRes.data);
        } catch (error) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [selectedMonth, selectedYear]);

    const exportCSV = () => {
        if (!yearlyData?.monthlyBreakdown) return;
        const headers = ['Month', 'Total Amount (₹)', 'Transaction Count'];
        const rows = yearlyData.monthlyBreakdown.map(item => [
            MONTHS[item.month - 1] || item.month,
            item.totalAmount,
            item.count
        ]);
        let csvContent = 'data:text/csv;charset=utf-8,'
            + headers.join(',') + '\n'
            + rows.map(r => r.join(',')).join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `Expentra_Report_${MONTHS[selectedMonth - 1]}_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalIncome = monthlyData?.totalIncome || 0;
    const totalSpent = monthlyData?.totalSpent || 0;
    const remainingBalance = totalIncome - totalSpent;
    const savingsRate = totalIncome > 0 ? ((remainingBalance / totalIncome) * 100).toFixed(1) : 0;

    const categoryData = (monthlyData?.categoryWise || []).map(cat => ({
        name: cat.category,
        value: cat.totalAmount,
        percentage: totalSpent > 0 ? ((cat.totalAmount / totalSpent) * 100).toFixed(1) : 0
    }));

    const currentYear = today.getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    if (loading && !monthlyData) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
                    <div className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
                    <p className="text-gray-600 text-sm mt-1">Analyze your income and spending patterns</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex gap-2 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                        <select
                            value={selectedMonth}
                            onChange={e => setSelectedMonth(Number(e.target.value))}
                            className="bg-transparent px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none rounded focus:ring-2 focus:ring-blue-500"
                        >
                            {MONTHS.map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <div className="w-px bg-gray-200"></div>
                        <select
                            value={selectedYear}
                            onChange={e => setSelectedYear(Number(e.target.value))}
                            className="bg-transparent px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none rounded focus:ring-2 focus:ring-blue-500"
                        >
                            {years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={exportCSV}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
                    >
                        <MdDownload className="mr-1" /> CSV
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Income</p>
                        <MdAttachMoney className="text-green-600 text-xl" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">₹{totalIncome.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{MONTHS[selectedMonth - 1]} {selectedYear}</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Expense</p>
                        <MdTrendingUp className="text-red-600 text-xl" />
                    </div>
                    <p className="text-2xl font-bold text-red-600 mt-2">₹{totalSpent.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{MONTHS[selectedMonth - 1]} {selectedYear}</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Remaining Balance</p>
                        <MdShowChart className={`text-xl ${remainingBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                    </div>
                    <p className={`text-2xl font-bold mt-2 ${remainingBalance >= 0 ? 'text-gray-900' : 'text-orange-600'}`}>
                        ₹{remainingBalance.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Savings Rate: {savingsRate}%</p>
                </div>
            </div>

            {/* Budget Warning */}
            {totalSpent > 0 && totalIncome > 0 && totalSpent > totalIncome && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                        <MdWarning className="text-red-500 text-xl" />
                        <div>
                            <p className="text-red-800 font-semibold">⚠️ You are spending more than your income this month!</p>
                            <p className="text-red-600 text-sm mt-0.5">
                                Overspent by <strong>₹{(totalSpent - totalIncome).toLocaleString()}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category-wise Pie Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <MdCategory className="text-blue-600 text-xl" />
                        <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
                    </div>
                    {categoryData.length > 0 ? (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        dataKey="value"
                                        label={({ name, percentage }) => percentage > 5 ? `${name} ${percentage}%` : ''}
                                        labelLine={false}
                                    >
                                        {categoryData.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={value => `₹${value.toLocaleString()}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex h-64 items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                            No expenses recorded for this month
                        </div>
                    )}
                </div>

                {/* Yearly Trend Line Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <MdShowChart className="text-blue-600 text-xl" />
                        <h3 className="text-lg font-semibold text-gray-900">Monthly Trend ({selectedYear})</h3>
                    </div>
                    {yearlyData?.monthlyBreakdown?.length > 0 ? (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <LineChart data={yearlyData.monthlyBreakdown}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="month"
                                        tickFormatter={val => MONTHS[val - 1] || val}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        formatter={v => `₹${v.toLocaleString()}`}
                                        labelFormatter={val => MONTHS[val - 1] || val}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="totalAmount"
                                        name="Expense (₹)"
                                        stroke="#2563EB"
                                        strokeWidth={2}
                                        dot={{ fill: '#2563EB', strokeWidth: 2 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex h-64 items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
                            No yearly data available
                        </div>
                    )}
                </div>
            </div>

            {/* Category Analysis Table */}
            {categoryData.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900">Detailed Category Analysis</h3>
                        <p className="text-sm text-gray-600 mt-0.5">Breakdown of your spending by category</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Amount Spent</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">% of Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {categoryData.map((cat, i) => (
                                    <tr key={cat.name} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                                ></span>
                                                {cat.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-right font-semibold text-gray-900">
                                            ₹{Number(cat.value).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-right text-gray-600">
                                            <div className="flex items-center justify-end gap-2">
                                                <span>{cat.percentage}%</span>
                                                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className="h-1.5 rounded-full"
                                                        style={{ width: `${cat.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50">
                                    <td className="px-6 py-3 text-sm font-bold text-gray-900">Total</td>
                                    <td className="px-6 py-3 text-sm text-right font-bold text-gray-900">
                                        ₹{totalSpent.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-right font-bold text-gray-600">100%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {categoryData.length === 0 && totalIncome === 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <MdAttachMoney className="w-16 h-16 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-600">No Data Available</h3>
                        <p className="text-gray-500 text-sm">
                            No income or expense records found for {MONTHS[selectedMonth - 1]} {selectedYear}.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;