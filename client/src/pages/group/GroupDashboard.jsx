import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
    MdGroup, MdAccountBalanceWallet,
    MdTrendingUp, MdPriorityHigh, MdShowChart
} from 'react-icons/md';

const GroupDashboard = () => {
    const { selectedGroupId, user } = useContext(AuthContext);
    const [groupData, setGroupData] = useState(null);
    const [settlements, setSettlements] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!selectedGroupId) return;
        const fetchGroupDashboard = async () => {
            try {
                const [groupRes, settleRes, expRes] = await Promise.all([
                    axios.get(`${API}/groups/${selectedGroupId}`),
                    axios.get(`${API}/group-expenses/${selectedGroupId}/settlements`),
                    axios.get(`${API}/group-expenses/${selectedGroupId}`)
                ]);
                setGroupData(groupRes.data);
                setSettlements(settleRes.data);
                setExpenses(expRes.data);
            } catch (error) {
                toast.error('Failed to load group dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchGroupDashboard();
    }, [selectedGroupId]);

    if (!selectedGroupId) {
        return (
            <div className="p-8 text-center bg-white rounded-lg border border-gray-200 shadow-sm mt-8">
                <p className="text-gray-600 text-sm">Please select a group from the Groups menu first.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const totalGroupExpense = expenses.reduce((acc, exp) => acc + exp.amount, 0);

    // Payment map
    const paymentMap = {};
    expenses.forEach(exp => {
        exp.paidBy.forEach(p => {
            const id = p.user ? p.user.toString() : p.name;
            paymentMap[id] = (paymentMap[id] || 0) + p.amount;
        });
    });

    // Top payer
    let topPayer = { name: 'N/A', amount: 0 };
    Object.keys(paymentMap).forEach(id => {
        if (paymentMap[id] > topPayer.amount) {
            topPayer = {
                name: groupData.members.find(
                    m => (m.user && m.user.toString() === id) || m.name === id
                )?.name || 'Member',
                amount: paymentMap[id]
            };
        }
    });

    // Top debtor
    let topDebtor = { name: 'All Settled', amount: 0 };
    settlements?.balances?.forEach(b => {
        if (b.balance < topDebtor.amount) {
            topDebtor = { name: b.memberInfo.name, amount: b.balance };
        }
    });

    // My balance
    const myBal = settlements?.balances?.find(
        b => b.memberInfo.user && user && b.memberInfo.user.toString() === user._id.toString()
    )?.balance || 0;
    const balLabel = myBal > 0 ? 'You Get Back' : myBal < 0 ? 'You Owe' : 'Your Balance';
    const balColor = myBal > 0 ? 'text-blue-600' : myBal < 0 ? 'text-red-600' : 'text-gray-900';

    const allSettlements = [
        ...(settlements?.overdueReimbursements || []),
        ...(settlements?.pendingReimbursements || [])
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{groupData?.name}</h1>
                <p className="text-sm text-gray-600 mt-1">Group Dashboard</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Members */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <MdGroup className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-600 uppercase">Members</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{groupData?.members?.length || 0}</p>
                </div>

                {/* My Balance */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <MdAccountBalanceWallet className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-600 uppercase">{balLabel}</span>
                    </div>
                    <p className={`text-2xl font-bold ${balColor}`}>₹{Math.abs(myBal).toLocaleString()}</p>
                </div>

                {/* Total Group Expense */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <MdShowChart className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-600 uppercase">Total Group</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">₹{totalGroupExpense.toLocaleString()}</p>
                </div>

                {/* Top Payer */}
                <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-blue-50 p-2 rounded-lg">
                            <MdTrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-600 uppercase">Top Payer</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900 truncate" title={topPayer.name}>
                        {topPayer.name}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Member Contributions */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <MdPriorityHigh className="w-4 h-4 text-blue-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase">Member Contributions</h3>
                        </div>
                        <div className="space-y-4">
                            {groupData?.members.map(m => {
                                const participantId = m.user ? m.user.toString() : m.name;
                                const paid = paymentMap[participantId] || 0;
                                const percentage = totalGroupExpense > 0 ? (paid / totalGroupExpense) * 100 : 0;
                                return (
                                    <div key={m._id} className="space-y-1.5">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-gray-700">{m.name}</span>
                                            <span className="font-semibold text-gray-900">
                                                ₹{paid.toLocaleString()}
                                                <span className="text-gray-500 font-normal"> ({percentage.toFixed(1)}%)</span>
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 transition-all duration-700"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pending Settlements */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">Pending Settlements</h3>
                        {allSettlements.length === 0 ? (
                            <div className="text-center py-10">
                                <span className="text-4xl">🎉</span>
                                <p className="text-gray-600 mt-2 text-sm font-medium">Everyone is all settled up!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {allSettlements.map((debt, i) => {
                                    const isOverdue = debt.reimbursementStatus === 'overdue';
                                    return (
                                        <div
                                            key={i}
                                            className={`p-4 rounded-lg border ${isOverdue
                                                    ? 'bg-red-50 border-red-200'
                                                    : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center text-sm mb-2 gap-1">
                                                <span className="font-semibold text-gray-900">{debt.from.name}</span>
                                                <span className="text-gray-500 text-xs">pays</span>
                                                <span className="font-semibold text-gray-900">{debt.to.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-lg font-bold ${isOverdue ? 'text-red-600' : 'text-gray-900'
                                                    }`}>
                                                    ₹{debt.amount.toLocaleString()}
                                                </span>
                                                {isOverdue && (
                                                    <span className="text-xs font-medium bg-red-500 text-white px-2 py-0.5 rounded-full uppercase">
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Urgent Settlement */}
                    <div className="bg-blue-600 rounded-lg p-6 shadow-sm text-white">
                        <h3 className="text-sm font-semibold uppercase tracking-wide mb-4 text-blue-100">
                            Urgent Settlement
                        </h3>
                        <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                            <p className="text-xs font-medium text-blue-200 uppercase mb-1">Most Owed to Group</p>
                            <p className="text-xl font-bold">{topDebtor.name}</p>
                            <p className="text-blue-100 font-medium mt-1 text-sm">
                                ₹{Math.abs(topDebtor.amount).toLocaleString()}
                            </p>
                        </div>
                        {topDebtor.name !== 'All Settled' && (
                            <p className="text-xs text-blue-100 mt-3">
                                Hey {topDebtor.name}, time to clear your debts!
                            </p>
                        )}
                    </div>

                    {/* Group Members List */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
                            Group Members
                        </h3>
                        <div className="space-y-3">
                            {groupData?.members.map(m => (
                                <div key={m._id || m.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-xs">
                                            {m.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                            {m.name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(m.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupDashboard;