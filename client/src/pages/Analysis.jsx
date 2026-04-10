import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API } from '../context/AuthContext';
import {
    MdTrendingUp, MdTrendingDown, MdLightbulb,
    MdHealthAndSafety, MdWarning, MdRefresh
} from 'react-icons/md';

const Analysis = () => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchAnalysis = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await axios.get(`${API}/analysis/summary`);
            setAnalysis(res.data);
        } catch (error) {
            setError(true);
            toast.error('Failed to load financial analysis. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 text-sm">Analyzing your financial data...</p>
            </div>
        );
    }

    if (error || !analysis) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-3">
                <p className="text-red-600 font-medium">Could not load analysis data.</p>
                <button
                    onClick={fetchAnalysis}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                >
                    <MdRefresh className="text-base" /> Retry
                </button>
            </div>
        );
    }

    const prediction = Number(analysis.futureExpensePrediction) || 0;
    const healthScoreRaw = analysis.financialHealthScore || '0/100';
    const healthScore = parseInt(healthScoreRaw.split('/')[0], 10) || 0;
    const topCategory = analysis.spendingPattern?.topCategory || 'N/A';
    const growthRaw = analysis.monthlyGrowthPercentage || '0%';
    const growthValue = parseFloat(growthRaw) || 0;
    const isPositiveGrowth = growthValue > 0;

    const healthColor =
        healthScore >= 80 ? 'text-blue-600' :
            healthScore >= 50 ? 'text-yellow-600' :
                'text-red-600';

    const healthBarColor =
        healthScore >= 80 ? 'bg-blue-600' :
            healthScore >= 50 ? 'bg-yellow-500' :
                'bg-red-500';

    const healthLabel =
        healthScore >= 80 ? 'Excellent! Well within budget.' :
            healthScore >= 50 ? 'Good, but watch your spending.' :
                'Over budget. Review expenses.';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Financial Insights</h1>
                <p className="text-sm text-gray-600 mt-1">AI-powered analysis of your spending</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Smart Prediction */}
                <div className="bg-blue-600 rounded-lg shadow-sm p-6 text-white flex flex-col justify-center min-h-[200px]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-white/10 rounded-lg p-2">
                            <MdLightbulb className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h2 className="text-base font-semibold">Smart Prediction</h2>
                    </div>
                    <p className="text-blue-100 text-xs mb-4">
                        Based on your 3-month rolling average, predicted spend next month:
                    </p>
                    {prediction > 0 ? (
                        <p className="text-3xl font-bold">
                            ₹{prediction.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </p>
                    ) : (
                        <p className="text-blue-100 text-sm italic">
                            Not enough data yet. Add expenses across multiple months to generate a prediction.
                        </p>
                    )}
                </div>

                {/* Health Score */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center">
                    <div className="bg-gray-100 rounded-lg p-3 mb-3">
                        <MdHealthAndSafety className={`w-7 h-7 ${healthColor}`} />
                    </div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                        Financial Health Score
                    </p>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-5xl font-bold ${healthColor}`}>{healthScore}</span>
                        <span className="text-xl text-gray-500 font-semibold">/100</span>
                    </div>
                    <div className="w-full mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-2 rounded-full transition-all ${healthBarColor}`}
                            style={{ width: `${Math.min(100, healthScore)}%` }}
                        />
                    </div>
                    <p className="mt-3 text-xs text-center text-gray-600 px-2">{healthLabel}</p>
                </div>

                {/* Top Spending Category */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex items-start gap-4">
                    <div className="bg-yellow-50 rounded-lg p-2 shrink-0">
                        <MdWarning className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Primary Expenditure Category</h3>
                        {topCategory !== 'N/A' ? (
                            <>
                                <p className="text-gray-700 text-sm mt-1">
                                    You spend the most on{' '}
                                    <span className="font-semibold text-yellow-600">{topCategory}</span> this month.
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                    Review this category to improve your health score.
                                </p>
                            </>
                        ) : (
                            <p className="text-gray-500 text-xs mt-1 italic">
                                No expense data for the current month yet.
                            </p>
                        )}
                    </div>
                </div>

                {/* Month-over-Month */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex items-start gap-4">
                    <div className={`rounded-lg p-2 shrink-0 ${isPositiveGrowth ? 'bg-red-50' : 'bg-blue-50'
                        }`}>
                        {isPositiveGrowth
                            ? <MdTrendingUp className="w-5 h-5 text-red-600" />
                            : <MdTrendingDown className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Month-over-Month Spending</h3>
                        {growthValue !== 0 ? (
                            <p className="text-gray-700 text-sm mt-1 flex items-center flex-wrap gap-2">
                                Your spending
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isPositiveGrowth
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {isPositiveGrowth ? '▲' : '▼'} {Math.abs(growthValue).toFixed(1)}%
                                </span>
                                {isPositiveGrowth ? 'increased' : 'decreased'} vs last month.
                            </p>
                        ) : (
                            <p className="text-gray-500 text-xs mt-1 italic">
                                No data to compare. Add expenses in consecutive months.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;