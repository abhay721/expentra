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
                <div className="bg-card rounded-lg border border-background p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4">
                        <MdHandshake className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-textColor">No Group Selected</h3>
                    <p className="text-textColor/70 mt-2">Please select a group from the Groups menu first.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="space-y-4">
                    <div className="h-32 bg-card rounded-lg animate-pulse"></div>
                    <div className="h-24 bg-card rounded-lg animate-pulse"></div>
                    <div className="h-24 bg-card rounded-lg animate-pulse"></div>
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

        return (
            <div className={`p-5 rounded-2xl border bg-card transition-all duration-200 border-background hover:shadow-md`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-background">
                            {isFromMe ? (
                                <MdCallMade className="w-5 h-5 text-danger" />
                            ) : isToMe ? (
                                <MdCallReceived className="w-5 h-5 text-secondary" />
                            ) : (
                                <MdHandshake className="w-5 h-5 text-primary" />
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold text-textColor/50 uppercase tracking-wider">
                                {isFromMe ? `You owe ${settlement.to.name}` :
                                    isToMe ? `${settlement.from.name} owes you` :
                                        `${settlement.from.name} → ${settlement.to.name}`}
                            </p>
                            <h4 className={`text-xl font-bold ${isFromMe ? 'text-danger' : isToMe ? 'text-secondary' : 'text-textColor'}`}>
                                ₹{settlement.amount.toLocaleString()}
                            </h4>
                        </div>
                    </div>
                    {status === 'overdue' && (
                        <div className="px-2 py-0.5 bg-danger/10 text-danger rounded text-[9px] font-bold uppercase">
                            Overdue
                        </div>
                    )}
                </div>

                {status !== 'paid' && (
                    <button
                        onClick={() => {
                            setSelectedSettlement(settlement);
                            setIsModalOpen(true);
                        }}
                        className="w-full py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                    >
                        Record Payment
                    </button>
                )}

                {status === 'paid' && (
                    <div className="flex items-center justify-center gap-1.5 py-1 text-textColor/40">
                        <MdCheckCircle className="text-sm" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Settled</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 bg-transparent pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-textColor">Settlements</h1>
                    <p className="text-sm text-textColor/60 mt-1 uppercase text-xs tracking-wide">
                        Group: {groupData?.name || 'Active Group'}
                    </p>
                </div>
            </div>

            {/* Premium Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-card rounded-2xl border border-background p-6 shadow-sm flex items-start gap-4">
                    <div className="bg-secondary/10 p-3 rounded-xl">
                        <MdCallReceived className="text-secondary text-2xl" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-textColor opacity-60 uppercase tracking-wide">Total Receivable</p>
                        <p className="text-2xl font-bold text-secondary mt-1">₹{totalOwedToUser.toLocaleString()}</p>
                        <p className="text-[10px] text-textColor opacity-40 mt-1 uppercase">Expected reimbursement</p>
                    </div>
                </div>

                <div className="bg-card rounded-2xl border border-background p-6 shadow-sm flex items-start gap-4">
                    <div className="bg-danger/10 p-3 rounded-xl">
                        <MdCallMade className="text-danger text-2xl" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-textColor opacity-60 uppercase tracking-wide">Total Payable</p>
                        <p className="text-2xl font-bold text-danger mt-1">₹{totalUserOwes.toLocaleString()}</p>
                        <p className="text-[10px] text-textColor opacity-40 mt-1 uppercase">To be settled by you</p>
                    </div>
                </div>
            </div>

            {/* Overdue/Pending Sections */}
            <div className="space-y-8">
                {overdueReimbursements.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <div className="w-1.5 h-4 bg-danger rounded-full" />
                            <h3 className="text-sm font-bold text-textColor uppercase tracking-wider">Overdue Payments</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {overdueReimbursements.map(s => (
                                <SettlementCard key={s._id} settlement={s} status="overdue" />
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <div className="w-1.5 h-4 bg-primary rounded-full" />
                        <h3 className="text-sm font-bold text-textColor uppercase tracking-wider">Pending Settlements</h3>
                    </div>

                    {pendingReimbursements.length === 0 && overdueReimbursements.length === 0 ? (
                        <div className="bg-card rounded-2xl border border-background p-12 text-center shadow-sm">
                            <MdCheckCircle className="w-16 h-16 text-secondary/30 mx-auto mb-4" />
                            <h4 className="text-lg font-bold text-textColor">All Settled!</h4>
                            <p className="text-sm text-textColor/50 mt-1 uppercase text-xs tracking-wide">You are all squared with the group.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingReimbursements.map(s => (
                                <SettlementCard key={s._id} settlement={s} status="pending" />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Net Balance Breakdown Table */}
            <div className="bg-card rounded-2xl border border-background shadow-sm overflow-hidden mb-12">
                <div className="px-6 py-4 border-b border-background flex items-center justify-between bg-background">
                    <h3 className="text-xs font-bold text-textColor opacity-70 uppercase tracking-wider flex items-center gap-2">
                        <MdAccountBalanceWallet className="text-primary text-xl" /> Group Net Balances
                    </h3>
                    <span className="text-[10px] font-bold text-textColor/40 uppercase tracking-widest">{balances.length} Members</span>
                </div>
                <div className="divide-y divide-background">
                    {balances.map((bal, idx) => {
                        const amt = bal.balance;
                        const isPos = amt > 0.01;
                        const isNeg = amt < -0.01;
                        return (
                            <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-background/50 transition-all duration-200">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                                        isPos ? 'bg-secondary/10 text-secondary' :
                                        isNeg ? 'bg-danger/10 text-danger' :
                                            'bg-background text-textColor/30'
                                    }`}>
                                        {bal.memberInfo.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-textColor">{bal.memberInfo.name}</p>
                                        <p className="text-[9px] font-semibold opacity-40 uppercase tracking-wider">
                                            {isPos ? 'Receivable' : isNeg ? 'Payable' : 'Settled'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-bold ${
                                        isPos ? 'text-secondary' :
                                        isNeg ? 'text-danger' :
                                            'text-textColor/30'
                                    }`}>
                                        {isPos ? '+' : ''}₹{Math.abs(amt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Settlement Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-textColor/40 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl overflow-hidden border border-background">
                        <div className="p-6 border-b border-background flex justify-between items-center bg-background">
                            <h3 className="text-sm font-bold text-textColor uppercase tracking-wider">Confirm Settlement</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-textColor/40 hover:text-textColor transition-colors"
                            >
                                <MdClose className="text-xl" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="text-center p-4 bg-background rounded-xl border border-background">
                                <p className="text-[10px] font-bold text-textColor/40 uppercase tracking-widest mb-1">
                                    Settling to {selectedSettlement?.to.name}
                                </p>
                                <h2 className="text-3xl font-bold text-textColor">
                                    ₹{selectedSettlement?.amount.toLocaleString()}
                                </h2>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-bold text-textColor/50 uppercase tracking-widest">
                                    Payment Method
                                </label>
                                <div className="space-y-2">
                                    {['cash', 'upi', 'bank_transfer'].map(method => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`w-full px-4 py-3 rounded-xl border text-left transition-all duration-200 flex items-center justify-between ${
                                                paymentMethod === method
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-background text-textColor/60 bg-background/50'
                                                }`}
                                        >
                                            <span className="text-xs font-bold uppercase tracking-wide">
                                                {method.replace('_', ' ')}
                                            </span>
                                            {paymentMethod === method && (
                                                <MdCheckCircle className="text-primary text-lg" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleMarkAsPaid}
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-sm"
                            >
                                Record Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settlement;