import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    MdTrendingUp, MdCategory, MdPerson, MdGroup, MdAttachMoney,
    MdShowChart, MdReceipt
} from 'react-icons/md';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC489A', '#06B6D4', '#84CC16'];

const GroupAnalytics = () => {
    const { selectedGroupId } = useContext(AuthContext);
    const [expenses, setExpenses] = useState([]);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!selectedGroupId) return;

        const fetchData = async () => {
            try {
                const [expRes, groupRes] = await Promise.all([
                    axios.get(`${API}/group-expenses/${selectedGroupId}`),
                    axios.get(`${API}/groups/${selectedGroupId}`)
                ]);
                setExpenses(expRes.data);
                setGroupData(groupRes.data);
            } catch (error) {
                toast.error("Failed to load group analytics data");
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 bg-gray-100 rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
                        <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    const totalSpent = expenses.reduce((acc, exp) => acc + exp.amount, 0);

    // Category wise spending
    const categoryMap = {};
    expenses.forEach(exp => {
        const cat = exp.category || 'General';
        categoryMap[cat] = (categoryMap[cat] || 0) + exp.amount;
    });
    const categoryData = Object.keys(categoryMap).map(key => ({
        name: key,
        value: categoryMap[key]
    })).sort((a, b) => b.value - a.value);

    // Who paid how much
    const paidByMap = {};
    expenses.forEach(exp => {
        if (Array.isArray(exp.paidBy)) {
            exp.paidBy.forEach(payer => {
                const name = payer.name || 'Unknown';
                paidByMap[name] = (paidByMap[name] || 0) + payer.amount;
            });
        } else {
            const name = exp.paidBy?.name || 'Unknown';
            paidByMap[name] = (paidByMap[name] || 0) + exp.amount;
        }
    });
    const paidByData = Object.keys(paidByMap).map(key => ({
        name: key,
        amount: paidByMap[key]
    })).sort((a, b) => b.amount - a.amount);

    // Monthly trend data
    const monthlyMap = {};
    expenses.forEach(exp => {
        const date = new Date(exp.date);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        const monthName = date.toLocaleString('default', { month: 'short' });
        if (!monthlyMap[monthKey]) {
            monthlyMap[monthKey] = { month: monthName, amount: 0, count: 0 };
        }
        monthlyMap[monthKey].amount += exp.amount;
        monthlyMap[monthKey].count += 1;
    });
    const monthlyData = Object.values(monthlyMap).sort((a, b) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(a.month) - months.indexOf(b.month);
    });

    const avgExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;
    const topPayer = paidByData[0]?.name || 'N/A';
    const topCategory = categoryData[0]?.name || 'N/A';

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Group Analytics</h1>
                <p className="text-gray-600 text-sm mt-1">
                    {groupData?.name} • Spending insights
                </p>
            </div>

            {expenses.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MdShowChart className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No Data Available</h3>
                    <p className="text-gray-600 mt-2">Add expenses to this group to see analytics.</p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Spending */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Spending</p>
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <MdAttachMoney className="w-4 h-4 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">₹{totalSpent.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">{expenses.length} transactions</p>
                        </div>

                        {/* Top Payer */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Top Payer</p>
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <MdPerson className="w-4 h-4 text-green-600" />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-gray-900 truncate">{topPayer}</p>
                            <p className="text-xs text-gray-500 mt-1">Highest contributor</p>
                        </div>

                        {/* Top Category */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Top Category</p>
                                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <MdCategory className="w-4 h-4 text-yellow-600" />
                                </div>
                            </div>
                            <p className="text-xl font-bold text-gray-900 truncate">{topCategory}</p>
                            <p className="text-xs text-gray-500 mt-1">Most spent on</p>
                        </div>

                        {/* Average Expense */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Avg Expense</p>
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <MdReceipt className="w-4 h-4 text-purple-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">₹{avgExpense.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">Per transaction</p>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Category Pie Chart */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                                <MdCategory className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">Spending by Category</h3>
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) =>
                                                percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                                            }
                                            outerRadius={90}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Contributions Bar Chart */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                                <MdPerson className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">Contributions by Member</h3>
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <BarChart
                                        data={paidByData}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis
                                            type="number"
                                            tickFormatter={(value) => `₹${value}`}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            width={80}
                                        />
                                        <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount Paid']} />
                                        <Bar dataKey="amount" fill="#2563EB" radius={[0, 8, 8, 0]} maxBarSize={40}>
                                            {paidByData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Trend Chart */}
                    {monthlyData.length > 1 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                                <MdTrendingUp className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-900">Monthly Spending Trend</h3>
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                        <YAxis tickFormatter={(value) => `₹${value}`} axisLine={false} tickLine={false} />
                                        <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Spending']} />
                                        <Bar dataKey="amount" fill="#2563EB" radius={[8, 8, 0, 0]}>
                                            {monthlyData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default GroupAnalytics;