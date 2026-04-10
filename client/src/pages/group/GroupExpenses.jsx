import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
    MdAdd, MdReceipt, MdKeyboardArrowDown, MdKeyboardArrowUp,
    MdCompareArrows, MdEdit, MdDelete, MdGroup, MdAttachMoney,
    MdPerson, MdCalendarToday, MdInfoOutline, MdCheckCircle
} from 'react-icons/md';

const GroupExpenses = () => {
    const navigate = useNavigate();
    const { selectedGroupId } = useContext(AuthContext);
    const [activities, setActivities] = useState([]);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedActivity, setExpandedActivity] = useState(null);

    const fetchData = async () => {
        try {
            const [expRes, groupRes] = await Promise.all([
                axios.get(`${API}/group-expenses/${selectedGroupId}`),
                axios.get(`${API}/groups/${selectedGroupId}`)
            ]);

            const rawExpenses = expRes.data;
            const transformedActivities = [];
            const settlementAggregator = {};

            rawExpenses.forEach(exp => {
                transformedActivities.push({
                    ...exp,
                    activityType: 'expense'
                });

                if (exp.settlements && exp.settlements.length > 0) {
                    exp.settlements.forEach(s => {
                        if (s.reimbursementStatus === 'paid') {
                            const dateKey = s.paymentDate ? new Date(s.paymentDate).getTime() : new Date(exp.date).getTime();
                            const fromKey = s.from.user || s.from.name;
                            const toKey = s.to.user || s.to.name;
                            const key = `${dateKey}_${fromKey}_${toKey}`;

                            if (!settlementAggregator[key]) {
                                settlementAggregator[key] = {
                                    _id: `settle_${key}`,
                                    activityType: 'settlement',
                                    title: `Settled: ${s.from.name} → ${s.to.name}`,
                                    amount: s.amount,
                                    date: new Date(dateKey),
                                    note: `Settled for group of expenses`,
                                    paymentMethod: s.paymentMethod,
                                    expensesCount: 1,
                                    underlyingExpenses: [{
                                        title: exp.title,
                                        amount: s.amount
                                    }]
                                };
                            } else {
                                settlementAggregator[key].amount += s.amount;
                                settlementAggregator[key].expensesCount += 1;
                                settlementAggregator[key].underlyingExpenses.push({
                                    title: exp.title,
                                    amount: s.amount
                                });
                            }
                        }
                    });
                }
            });

            Object.values(settlementAggregator).forEach(aggS => {
                transformedActivities.push(aggS);
            });

            transformedActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
            setActivities(transformedActivities);
            setGroupData(groupRes.data);
        } catch (error) {
            toast.error("Failed to load activities");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedGroupId) return;
        fetchData();
    }, [selectedGroupId]);

    const handleDeleteExpense = async (expenseId) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) {
            return;
        }
        try {
            await axios.delete(`${API}/group-expenses/${selectedGroupId}/${expenseId}`);
            toast.success("Expense deleted successfully");
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete expense");
        }
    };

    if (!selectedGroupId) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MdGroup className="w-10 h-10 text-blue-600" />
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
                    <div className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
                    <div className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                    <div className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{groupData?.name}</h1>
                    <p className="text-gray-600 text-sm mt-1">Group expenses and settlement history</p>
                </div>
                <button
                    onClick={() => navigate('/groups/add-expense')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <MdAdd className="text-lg" />
                    Add Expense
                </button>
            </div>

            {/* Activities List */}
            <div className="space-y-4">
                {activities.map((act) => {
                    const isExpense = act.activityType === 'expense';
                    const isExpanded = expandedActivity === act._id;

                    if (isExpense) {
                        const payers = act.paidBy?.map(p => p.name).join(', ') || 'Unknown';
                        return (
                            <div
                                key={act._id}
                                className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
                            >
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => setExpandedActivity(isExpanded ? null : act._id)}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 bg-gray-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                            <MdReceipt className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900 truncate">{act.title}</h3>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <MdCalendarToday className="text-xs" />
                                                    {new Date(act.date).toLocaleDateString()}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <MdPerson className="text-xs" />
                                                    Paid by {payers}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">₹{act.amount.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">Total</p>
                                        </div>
                                        <div className="text-gray-400">
                                            {isExpanded ? <MdKeyboardArrowUp className="w-5 h-5" /> : <MdKeyboardArrowDown className="w-5 h-5" />}
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-3 border-t border-gray-200 space-y-4">
                                        {/* Action Buttons */}
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/groups/expenses/edit/${act._id}`); }}
                                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-gray-100 rounded transition-colors"
                                            >
                                                <MdEdit className="text-sm" /> Edit
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteExpense(act._id); }}
                                                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <MdDelete className="text-sm" /> Delete
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Payment Breakdown */}
                                            <div>
                                                <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-1">
                                                    <MdAttachMoney className="text-blue-600" /> Payment Breakdown
                                                </h4>
                                                <div className="space-y-2">
                                                    {act.paidBy?.map((p, i) => (
                                                        <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                            <span className="text-sm text-gray-900">{p.name}</span>
                                                            <span className="text-sm font-semibold text-gray-900">₹{p.amount?.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Split Details */}
                                            <div>
                                                <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-1">
                                                    <MdGroup className="text-blue-600" /> Split Details
                                                </h4>
                                                <div className="space-y-2">
                                                    {act.splitBetween?.map((s, i) => (
                                                        <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                            <span className="text-sm text-gray-900">{s.name}</span>
                                                            <span className="text-sm font-semibold text-blue-600">₹{s.amount?.toLocaleString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Settlements */}
                                        {act.settlements && act.settlements.length > 0 && (
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <h4 className="text-xs font-semibold text-green-600 uppercase mb-2 flex items-center gap-1">
                                                    <MdCompareArrows /> Settlements
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {act.settlements.map((s, i) => (
                                                        <div
                                                            key={i}
                                                            className={`flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-sm shadow-sm border ${s.reimbursementStatus === 'paid' ? 'border-green-300' : 'border-gray-200'
                                                                }`}
                                                        >
                                                            <span className="font-medium text-gray-900">{s.from.name}</span>
                                                            <span className="text-gray-500">→</span>
                                                            <span className="font-medium text-gray-900">{s.to.name}</span>
                                                            <span className="font-bold text-green-600">₹{s.amount.toLocaleString()}</span>
                                                            {s.reimbursementStatus === 'paid' && <MdCheckCircle className="text-green-600 text-sm" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Note */}
                                        {act.note && (
                                            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                                <MdInfoOutline className="text-gray-500 text-sm mt-0.5" />
                                                <p className="text-xs text-gray-600 italic">{act.note}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    } else {
                        // Settlement Activity
                        return (
                            <div
                                key={act._id}
                                className="bg-white rounded-lg border border-green-200 shadow-sm overflow-hidden"
                            >
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => setExpandedActivity(isExpanded ? null : act._id)}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 bg-gray-100 text-green-600 rounded-lg flex items-center justify-center shrink-0">
                                            <MdCompareArrows className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900 truncate">{act.title}</h3>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <MdCalendarToday className="text-xs" />
                                                    {new Date(act.date).toLocaleDateString()}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    Method: <span className="font-medium text-green-600 uppercase text-xs">{act.paymentMethod || 'cash'}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-green-600">₹{act.amount.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500">Settled</p>
                                        </div>
                                        <div className="text-green-400">
                                            {isExpanded ? <MdKeyboardArrowUp className="w-5 h-5" /> : <MdKeyboardArrowDown className="w-5 h-5" />}
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-3 border-t border-gray-200 space-y-3">
                                        <h4 className="text-xs font-semibold text-green-600 uppercase mb-2 flex items-center gap-1">
                                            <MdReceipt className="text-sm" /> Expense Breakdown
                                        </h4>
                                        <div className="space-y-2">
                                            {act.underlyingExpenses?.map((ue, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                    <span className="text-sm text-gray-700 truncate max-w-[250px]">{ue.title}</span>
                                                    <span className="text-sm font-semibold text-green-600">₹{ue.amount?.toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-gray-100 px-3 py-1.5 rounded-full">
                                            <MdInfoOutline className="text-xs" />
                                            Total of {act.expensesCount} expense settlement(s)
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    }
                })}

                {activities.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MdReceipt className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No Activity Yet</h3>
                        <p className="text-gray-600 mt-1">Add your first expense to start tracking!</p>
                        <button
                            onClick={() => navigate('/groups/add-expense')}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <MdAdd className="text-base" />
                            Add Expense
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupExpenses;