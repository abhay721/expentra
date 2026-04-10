import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
    MdHandshake,
    MdAccountBalanceWallet,
    MdCallMade,
    MdCallReceived,
    MdCheckCircle,
    MdPriorityHigh,
    MdPayment,
    MdClose
} from 'react-icons/md';

const Settlement = () => {
    const { selectedGroupId, user } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSettlement, setSelectedSettlement] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const fetchData = async () => {
        try {
            const [groupRes, settleRes] = await Promise.all([
                axios.get(`${API}/groups/${selectedGroupId}`),
                axios.get(`${API}/group-expenses/${selectedGroupId}/settlements`)
            ]);
            setGroupData(groupRes.data);
            setData(settleRes.data);
        } catch (error) {
            toast.error("Failed to load settlements");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedGroupId) return;
        fetchData();
    }, [selectedGroupId]);

    const handleMarkAsPaid = async () => {
        if (!selectedSettlement) return;
        try {
            await axios.patch(
                `${API}/group-expenses/${selectedGroupId}/settlements/${selectedSettlement.expenseId}/${selectedSettlement._id}/paid`,
                { paymentMethod }
            );
            toast.success("Settlement recorded!");
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to record payment");
        }
    };

    if (!selectedGroupId) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MdHandshake className="w-8 h-8 text-blue-600" />
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

    const {
        balances = [],
        totalOwedToUser = 0,
        totalUserOwes = 0,
        pendingReimbursements = [],
        overdueReimbursements = []
    } = data || {};

    const SettlementCard = ({ settlement, status }) => {
        const isFromMe = settlement.from.user === (user?._id || user?.id);
        const isToMe = settlement.to.user === (user?._id || user?.id);

        const statusColors = {
            pending: 'border-yellow-200 bg-yellow-50',
            overdue: 'border-red-200 bg-red-50',
            paid: 'border-gray-200 bg-gray-50'
        };

        const badgeColors = {
            pending: 'bg-yellow-100 text-yellow-700',
            overdue: 'bg-red-500 text-white',
            paid: 'bg-gray-100 text-gray-600'
        };

        return (
            <div className={`p-4 rounded-lg border ${statusColors[status]}`}>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-white`}>
                            {isFromMe ? (
                                <MdCallMade className="w-5 h-5 text-red-500" />
                            ) : isToMe ? (
                                <MdCallReceived className="w-5 h-5 text-green-600" />
                            ) : (
                                <MdHandshake className="w-5 h-5 text-gray-500" />
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-600">
                                {isFromMe ? `You owe ${settlement.to.name}` :
                                    isToMe ? `${settlement.from.name} owes you` :
                                        `${settlement.from.name} → ${settlement.to.name}`}
                            </p>
                            <h4 className="text-2xl font-bold text-gray-900">₹{settlement.amount.toLocaleString()}</h4>
                        </div>
                    </div>
                    {status === 'overdue' && (
                        <span className="flex items-center gap-1 text-xs font-medium bg-red-500 text-white px-2 py-1 rounded-full">
                            <MdPriorityHigh className="text-xs" /> Overdue
                        </span>
                    )}
                </div>

                {status !== 'paid' && (
                    <button
                        onClick={() => {
                            setSelectedSettlement(settlement);
                            setIsModalOpen(true);
                        }}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition active:scale-95 flex items-center justify-center gap-2"
                    >
                        <MdPayment /> Mark as Paid
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Settlements</h1>
                <p className="text-gray-600 text-sm mt-1">{groupData?.name || 'Group'}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-600 rounded-lg p-6 text-white shadow-sm">
                    <p className="text-blue-100 text-xs font-medium uppercase tracking-wide mb-1">You Are Owed</p>
                    <h2 className="text-3xl font-bold">₹{totalOwedToUser.toLocaleString()}</h2>
                </div>
                <div className="bg-white border border-red-200 rounded-lg p-6 shadow-sm">
                    <p className="text-red-500 text-xs font-medium uppercase tracking-wide mb-1">You Owe</p>
                    <h2 className="text-3xl font-bold text-red-600">₹{totalUserOwes.toLocaleString()}</h2>
                </div>
            </div>

            {/* Overdue Section */}
            {overdueReimbursements.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-5 bg-red-500 rounded-full"></div>
                        <h3 className="text-sm font-semibold text-gray-900">
                            Overdue
                            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                                {overdueReimbursements.length}
                            </span>
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {overdueReimbursements.map(s => (
                            <SettlementCard key={s._id} settlement={s} status="overdue" />
                        ))}
                    </div>
                </div>
            )}

            {/* Pending Section */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 bg-yellow-500 rounded-full"></div>
                    <h3 className="text-sm font-semibold text-gray-900">
                        Pending
                        <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            {pendingReimbursements.length}
                        </span>
                    </h3>
                </div>

                {pendingReimbursements.length === 0 && overdueReimbursements.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <MdCheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <h4 className="text-base font-semibold text-gray-900">All Settled!</h4>
                        <p className="text-gray-600 text-sm">No pending debts in this group.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingReimbursements.map(s => (
                            <SettlementCard key={s._id} settlement={s} status="pending" />
                        ))}
                    </div>
                )}
            </div>

            {/* Group Balances */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <MdAccountBalanceWallet className="text-blue-600" /> Group Net Balances
                </h3>
                <div className="divide-y divide-gray-100">
                    {balances.map((bal, idx) => {
                        const amt = bal.balance;
                        const isPos = amt > 0.01;
                        const isNeg = amt < -0.01;
                        return (
                            <div key={idx} className="py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium text-sm ${isPos ? 'bg-blue-100 text-blue-600' :
                                            isNeg ? 'bg-red-100 text-red-600' :
                                                'bg-gray-100 text-gray-500'
                                        }`}>
                                        {bal.memberInfo.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium text-gray-900 text-sm">{bal.memberInfo.name}</span>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-sm ${isPos ? 'text-blue-600' :
                                            isNeg ? 'text-red-600' :
                                                'text-gray-500'
                                        }`}>
                                        {isPos ? '+' : ''}₹{Math.abs(amt).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {isPos ? 'is owed' : isNeg ? 'owes' : 'settled'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white w-full max-w-sm rounded-lg shadow-xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-blue-600 px-5 py-4 flex justify-between items-center">
                            <h3 className="text-white font-semibold">Confirm Payment</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 hover:bg-white/10 rounded transition text-white"
                            >
                                <MdClose className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            <div className="text-center">
                                <p className="text-gray-600 text-xs font-medium uppercase tracking-wide mb-1">
                                    Paying {selectedSettlement?.to.name}
                                </p>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    ₹{selectedSettlement?.amount.toLocaleString()}
                                </h2>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                                    Payment Method
                                </label>
                                <div className="space-y-2">
                                    {['cash', 'upi', 'bank_transfer'].map(method => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`w-full px-4 py-2.5 rounded-lg border text-left text-sm font-medium flex items-center justify-between transition ${paymentMethod === method
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                                }`}
                                        >
                                            <span className="capitalize">{method.replace('_', ' ')}</span>
                                            {paymentMethod === method && (
                                                <MdCheckCircle className="text-blue-600 w-5 h-5" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleMarkAsPaid}
                                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition active:scale-95"
                            >
                                Confirm Settlement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settlement;