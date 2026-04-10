import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#2563EB', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4'];

const Dashboard = () => {
    const { user, setAppMode, setSelectedGroupId } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [analysis, setAnalysis] = useState(null);
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [budgetStatus, setBudgetStatus] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const today = new Date();
                const month = today.getMonth() + 1;
                const year = today.getFullYear();

                const [analysisRes, reportRes, budgetRes] = await Promise.all([
                    axios.get(`${API}/analysis/summary`).catch(() => ({ data: null })),
                    axios.get(`${API}/reports/monthly?month=${month}&year=${year}`).catch(() => ({ data: null })),
                    axios.get(`${API}/budget?month=${month}&year=${year}`).catch(() => ({ data: null }))
                ]);

                setAnalysis(analysisRes.data);
                setMonthlyReport(reportRes.data);
                setBudgetStatus(budgetRes.data);
            } catch (error) {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleSwitchToGroup = async () => {
        try {
            const res = await axios.get(`${API}/groups`);
            if (res.data.length > 0) {
                setSelectedGroupId(res.data[0]._id);
                setAppMode('group');
                navigate('/groups/dashboard');
            } else {
                toast.info("You don't have any groups yet. Please create one.");
                navigate('/groups');
            }
        } catch (error) {
            toast.error("Failed to load groups");
            navigate('/groups');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const categoryData = monthlyReport?.categoryWise?.map(cat => ({
        name: cat.category,
        value: cat.totalAmount
    })) || [];

    const incomePercentage = monthlyReport?.totalIncome ?
        ((monthlyReport.totalSpent / monthlyReport.totalIncome) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-600 text-sm mt-1">Real-time financial tracking</p>
                </div>
                <button
                    onClick={handleSwitchToGroup}
                    className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition shadow-sm"
                >
                    Switch to Group
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Income */}
                <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Income</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        ₹{(monthlyReport?.totalIncome || 0).toLocaleString()}
                    </p>
                    <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full w-full"></div>
                    </div>
                </div>

                {/* Total Expense */}
                <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Expense</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        ₹{(monthlyReport?.totalSpent || 0).toLocaleString()}
                    </p>
                    <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${Math.min(incomePercentage, 100)}%` }}>
                        </div>
                    </div>
                </div>

                {/* Remaining Budget */}
                <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Remaining Budget</p>
                    <p className={`text-2xl font-bold mt-1 ${budgetStatus?.isExceeded ? 'text-red-600' : 'text-gray-900'
                        }`}>
                        ₹{(budgetStatus?.remaining || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Limit: ₹{budgetStatus?.budget?.toLocaleString() || 'N/A'}
                    </p>
                </div>

                {/* Balance */}
                <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Balance</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                        ₹{(monthlyReport?.remainingBalance || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Income - Expense</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Distribution Pie Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Category Distribution</h3>
                        <p className="text-xs text-gray-600 mt-1">Current Month Spending</p>
                    </div>

                    {categoryData.length > 0 ? (
                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => `₹${value.toLocaleString()}`}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                                        iconType="circle"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                            <p className="text-gray-500 font-medium">No expenses recorded this month</p>
                        </div>
                    )}
                </div>

                {/* Financial Insights */}
                <div className="bg-gray-900 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-white mb-1">Financial Insights</h3>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-6">AI Powered Analysis</p>

                    <div className="space-y-4">
                        {/* Top Spending Pattern */}
                        <div className="p-4 bg-gray-800 rounded-lg">
                            <p className="text-xs font-medium text-green-400 uppercase tracking-wide mb-2">
                                Top Spending Pattern
                            </p>
                            <p className="text-xl font-bold text-white">
                                {analysis?.spendingPattern?.topCategory || 'Gathering insights...'}
                            </p>
                        </div>

                        {/* Projected Next Month */}
                        <div className="p-4 bg-gray-800 rounded-lg">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                                Projected Next Month
                            </p>
                            <p className="text-2xl font-bold text-green-400">
                                {Number(analysis?.futureExpensePrediction) > 0
                                    ? `₹${Number(analysis.futureExpensePrediction).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                                    : 'More data needed'}
                            </p>
                            <p className="text-xs text-gray-500 mt-2 uppercase tracking-wide">
                                Calculated from 3-month trend
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;