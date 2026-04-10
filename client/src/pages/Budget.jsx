import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MdWarning, MdCheckCircle, MdSavings, MdAttachMoney, MdTrendingUp, MdAccountBalance, MdTrackChanges } from 'react-icons/md';
import { API } from '../context/AuthContext';

const Budget = () => {
    const [budgetStatus, setBudgetStatus] = useState(null);
    const [amount, setAmount] = useState('');
    const [savingGoal, setSavingGoal] = useState('');
    const [loading, setLoading] = useState(true);
    const [monthlyReport, setMonthlyReport] = useState(null);

    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const fetchBudgetAndReport = async () => {
        try {
            const [budgetRes, reportRes] = await Promise.all([
                axios.get(`${API}/budget?month=${month}&year=${year}`).catch(() => ({ data: null })),
                axios.get(`${API}/reports/monthly?month=${month}&year=${year}`).catch(() => ({ data: null }))
            ]);

            if (budgetRes.data) {
                setBudgetStatus(budgetRes.data);
                setAmount(budgetRes.data.budget || '');
                setSavingGoal(budgetRes.data.savingGoal || '');
            } else {
                setBudgetStatus(null);
            }

            if (reportRes.data) {
                setMonthlyReport(reportRes.data);
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgetAndReport();
    }, []);

    const handleSetBudget = async (e) => {
        e.preventDefault();
        if (Number(amount) <= 0) {
            toast.error('Budget amount must be greater than 0');
            return;
        }
        try {
            await axios.post(`${API}/budget`, {
                month,
                year,
                limitAmount: Number(amount),
                savingGoal: savingGoal ? Number(savingGoal) : 0,
            });
            toast.success('Budget saved successfully!');
            fetchBudgetAndReport();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to set budget');
        }
    };

    const utilization = budgetStatus
        ? Math.min(100, (budgetStatus.totalSpent / budgetStatus.budget) * 100)
        : 0;

    const progressColor = budgetStatus?.isExceeded
        ? 'bg-red-500'
        : budgetStatus?.isNearLimit
            ? 'bg-yellow-500'
            : 'bg-blue-600';

    const currentSavings = monthlyReport
        ? monthlyReport.totalIncome - monthlyReport.totalSpent
        : (budgetStatus ? budgetStatus.budget - budgetStatus.totalSpent : 0);

    const savingsProgress = budgetStatus?.savingGoal > 0
        ? Math.min(100, (Math.max(0, currentSavings) / budgetStatus.savingGoal) * 100)
        : 0;

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-48 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Monthly Budget</h1>
                <p className="text-gray-600 text-sm mt-1">Set spending limits and track your savings goals</p>
            </div>

            {/* Set Budget Form */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Set Budget for {MONTHS[month - 1]} {year}
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5">Define your monthly spending limit and savings target</p>
                </div>
                <form onSubmit={handleSetBudget} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <MdAttachMoney className="text-blue-600" />
                                Max Spend Limit (₹)
                            </label>
                            <input
                                type="number" required min="1"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="e.g. 30000"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <MdTrackChanges className="text-blue-600" />
                                Savings Goal (₹)
                                <span className="text-gray-500 text-xs ml-1">(optional)</span>
                            </label>
                            <input
                                type="number" min="0"
                                value={savingGoal}
                                onChange={e => setSavingGoal(e.target.value)}
                                placeholder="e.g. 5000"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Save Budget
                        </button>
                    </div>
                </form>
            </div>

            {/* Budget Overview */}
            {budgetStatus && (
                <div className="space-y-6">
                    {/* Warning Banner */}
                    {budgetStatus.warning && (
                        <div className={`rounded-lg border-l-4 p-4 flex items-start gap-3 ${budgetStatus.isExceeded
                                ? 'bg-red-50 border-red-500'
                                : 'bg-yellow-50 border-yellow-500'
                            }`}>
                            <MdWarning className={`w-5 h-5 shrink-0 ${budgetStatus.isExceeded ? 'text-red-500' : 'text-yellow-500'
                                }`} />
                            <div>
                                <h3 className={`font-semibold ${budgetStatus.isExceeded ? 'text-red-800' : 'text-yellow-800'
                                    }`}>
                                    {budgetStatus.isExceeded ? 'Budget Exceeded!' : 'Approaching Budget Limit'}
                                </h3>
                                <p className={`mt-1 text-sm ${budgetStatus.isExceeded ? 'text-red-700' : 'text-yellow-700'
                                    }`}>
                                    {budgetStatus.warning}
                                </p>
                            </div>
                        </div>
                    )}

                    {!budgetStatus.warning && (
                        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 flex items-center gap-3">
                            <MdCheckCircle className="text-green-500 w-5 h-5 shrink-0" />
                            <p className="text-green-800 font-medium">
                                You are within budget! Keep up the great work 🎉
                            </p>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Budget Limit</p>
                                <MdAccountBalance className="text-blue-600 text-xl" />
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mt-2">₹{budgetStatus.budget.toLocaleString()}</p>
                        </div>

                        <div className={`bg-white rounded-lg border p-5 shadow-sm ${budgetStatus.isExceeded ? 'border-red-200' : 'border-gray-200'
                            }`}>
                            <div className="flex items-center justify-between">
                                <p className={`text-xs font-medium uppercase tracking-wide ${budgetStatus.isExceeded ? 'text-red-700' : 'text-gray-600'
                                    }`}>
                                    Total Spent
                                </p>
                                <MdTrendingUp className={budgetStatus.isExceeded ? 'text-red-500' : 'text-gray-400'} />
                            </div>
                            <p className={`text-2xl font-bold mt-2 ${budgetStatus.isExceeded ? 'text-red-700' : 'text-gray-900'
                                }`}>
                                ₹{budgetStatus.totalSpent.toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Remaining</p>
                                <MdSavings className="text-green-600 text-xl" />
                            </div>
                            <p className={`text-2xl font-bold mt-2 ${budgetStatus.remaining < 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                ₹{budgetStatus.remaining.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Utilization Bar */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-gray-700">Budget Utilization</span>
                            <span className={`text-sm font-semibold ${budgetStatus.isExceeded ? 'text-red-600' :
                                    budgetStatus.isNearLimit ? 'text-yellow-600' : 'text-blue-600'
                                }`}>
                                {utilization.toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all ${progressColor}`}
                                style={{ width: `${Math.min(100, utilization)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>₹0</span>
                            <span className="text-yellow-600 font-medium">80% — ₹{(budgetStatus.budget * 0.8).toLocaleString()}</span>
                            <span>₹{budgetStatus.budget.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Savings Goal Tracker */}
                    {budgetStatus.savingGoal > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <MdSavings className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Savings Goal Tracker</h3>
                                    <p className="text-xs text-gray-600">Track your progress toward your savings target</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-purple-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-600 uppercase mb-1">Target</p>
                                    <p className="text-lg font-bold text-purple-700">₹{budgetStatus.savingGoal.toLocaleString()}</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-600 uppercase mb-1">Saved</p>
                                    <p className={`text-lg font-bold ${currentSavings >= budgetStatus.savingGoal ? 'text-green-600' : 'text-purple-700'
                                        }`}>
                                        ₹{Math.max(0, currentSavings).toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-600 uppercase mb-1">Progress</p>
                                    <p className="text-lg font-bold text-purple-700">{savingsProgress.toFixed(1)}%</p>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="h-2 rounded-full bg-purple-600 transition-all"
                                    style={{ width: `${savingsProgress}%` }}
                                />
                            </div>
                            {currentSavings < 0 && (
                                <p className="text-xs text-red-600 mt-3 flex items-center gap-1">
                                    <MdWarning className="text-sm" />
                                    You're overspending. Reduce expenses to reach your savings goal.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!budgetStatus && !loading && (
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-blue-50 rounded-full">
                            <MdAccountBalance className="w-12 h-12 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No Budget Set</h3>
                        <p className="text-gray-600 max-w-md">
                            You haven't set a budget for {MONTHS[month - 1]} {year}.
                            Use the form above to set your monthly spending limit.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budget;