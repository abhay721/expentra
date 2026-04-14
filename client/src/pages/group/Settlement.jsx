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

        const statusStyles = {
            pending: 'border-background bg-card hover:border-primary/20',
            overdue: 'border-danger/20 bg-danger/5/20 hover:border-danger/30',
            paid: 'border-background bg-background/30 grayscale'
        };

        return (
            <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg shadow-sm ${statusStyles[status]}`}>
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-background flex items-center justify-center shadow-sm border border-background`}>
                            {isFromMe ? (
                                <MdCallMade className="w-6 h-6 text-danger" />
                            ) : isToMe ? (
                                <MdCallReceived className="w-6 h-6 text-secondary" />
                            ) : (
                                <MdHandshake className="w-6 h-6 text-primary" />
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-textColor/50 uppercase tracking-widest mb-1">
                                {isFromMe ? `You owe ${settlement.to.name}` :
                                    isToMe ? `${settlement.from.name} owes you` :
                                        `${settlement.from.name} → ${settlement.to.name}`}
                            </p>
                            <h4 className={`text-2xl font-black tracking-tight ${isFromMe ? 'text-danger' : isToMe ? 'text-secondary' : 'text-textColor'}`}>
                                ₹{settlement.amount.toLocaleString()}
                            </h4>
                        </div>
                    </div>
                    {status === 'overdue' && (
                        <div className="w-8 h-8 bg-danger text-white rounded-lg flex items-center justify-center shadow-md shadow-danger/20 animate-pulse">
                            <MdPriorityHigh className="w-5 h-5" />
                        </div>
                    )}
                </div>

                {status !== 'paid' && (
                    <button
                        onClick={() => {
                            setSelectedSettlement(settlement);
                            setIsModalOpen(true);
                        }}
                        className="w-full py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <MdPayment className="text-lg" /> Record Payment
                    </button>
                )}

                {status === 'paid' && (
                    <div className="flex items-center justify-center gap-2 py-2 text-textColor/50">
                        <MdCheckCircle className="text-sm" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Settled</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-10 bg-background min-h-screen pb-24">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <MdHandshake className="text-primary text-lg" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Settlements Overview</span>
                    </div>
                    <h1 className="text-3xl font-black text-textColor tracking-tight">Group Balances</h1>
                    <p className="text-sm font-semibold text-textColor/50 mt-1 uppercase tracking-widest">{groupData?.name || 'Active Group'}</p>
                </div>
            </div>

            {/* Premium Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-primary rounded-[32px] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-card/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-4">Total Receivable</p>
                    <div className="flex items-center justify-between">
                        <h2 className="text-4xl font-black tracking-tighter">₹{totalOwedToUser.toLocaleString()}</h2>
                        <div className="w-12 h-12 bg-card/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <MdCallReceived className="w-7 h-7" />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-white/40 mt-6 uppercase tracking-widest">Expected from group members</p>
                </div>

                <div className="bg-card rounded-[32px] p-8 border border-background shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-danger/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    <p className="text-[10px] font-black text-textColor/50 uppercase tracking-widest mb-4">Total Payable</p>
                    <div className="flex items-center justify-between">
                        <h2 className="text-4xl font-black text-danger tracking-tighter">₹{totalUserOwes.toLocaleString()}</h2>
                        <div className="w-12 h-12 bg-danger/5 rounded-2xl flex items-center justify-center text-danger border border-danger/20">
                            <MdCallMade className="w-7 h-7" />
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-textColor/40 mt-6 uppercase tracking-widest">You need to settle back</p>
                </div>
            </div>

            {/* Urgent / Overdue Section */}
            {overdueReimbursements.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-6 bg-danger rounded-full" />
                            <h3 className="text-sm font-black text-danger uppercase tracking-widest">
                                Overdue Payments
                            </h3>
                        </div>
                        <span className="px-4 py-1.5 bg-danger text-white text-[10px] font-black rounded-full shadow-lg shadow-danger/20">
                            {overdueReimbursements.length} Urgent
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {overdueReimbursements.map(s => (
                            <SettlementCard key={s._id} settlement={s} status="overdue" />
                        ))}
                    </div>
                </div>
            )}

            {/* Pending Section */}
            <div>
                <div className="flex items-center justify-between mb-6 px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-6 bg-primary rounded-full" />
                        <h3 className="text-sm font-black text-textColor uppercase tracking-widest">
                            Pending Settlements
                        </h3>
                    </div>
                    <span className="px-4 py-1.5 bg-background border border-background text-[10px] font-black rounded-full text-textColor/50 tracking-widest uppercase">
                        {pendingReimbursements.length} Open
                    </span>
                </div>

                {pendingReimbursements.length === 0 && overdueReimbursements.length === 0 ? (
                    <div className="bg-card rounded-[40px] border border-background p-24 text-center shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-secondary/5 opacity-50" />
                        <div className="relative z-10">
                            <MdCheckCircle className="w-20 h-20 text-secondary mx-auto mb-6 drop-shadow-sm" />
                            <h4 className="text-2xl font-black text-textColor tracking-tight">All Settlements Cleared!</h4>
                            <p className="text-sm font-semibold text-textColor/50 mt-2 max-w-xs mx-auto uppercase tracking-widest">You are all squared with the group members.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingReimbursements.map(s => (
                            <SettlementCard key={s._id} settlement={s} status="pending" />
                        ))}
                    </div>
                )}
            </div>

            {/* Net Balance Breakdown Table */}
            <div className="bg-card rounded-[32px] border border-background shadow-sm overflow-hidden mb-12">
                <div className="px-8 py-6 border-b border-background flex items-center justify-between bg-background/30">
                    <h3 className="text-[10px] font-black text-textColor/50 uppercase tracking-widest flex items-center gap-3">
                        <MdAccountBalanceWallet className="text-primary text-xl" /> Group Net Balances
                    </h3>
                    <span className="text-[10px] font-black text-textColor/40 uppercase tracking-widest">{balances.length} Members</span>
                </div>
                <div className="divide-y divide-background">
                    {balances.map((bal, idx) => {
                        const amt = bal.balance;
                        const isPos = amt > 0.01;
                        const isNeg = amt < -0.01;
                        return (
                            <div key={idx} className="px-8 py-6 flex items-center justify-between hover:bg-background/50 transition-all duration-300 group">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-110 ${
                                        isPos ? 'bg-secondary/10 text-secondary' :
                                        isNeg ? 'bg-danger/10 text-danger' :
                                            'bg-card text-textColor/50'
                                    }`}>
                                        {bal.memberInfo.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-textColor leading-tight">{bal.memberInfo.name}</p>
                                        <p className="text-[9px] font-black opacity-30 uppercase tracking-widest mt-1">
                                            {isPos ? 'Net Receivable' : isNeg ? 'Net Payable' : 'Fully Settled'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xl font-black tracking-tight ${
                                        isPos ? 'text-secondary' :
                                        isNeg ? 'text-danger' :
                                            'text-textColor/40'
                                    }`}>
                                        {isPos ? '+' : ''}₹{Math.abs(amt).toLocaleString()}
                                    </p>
                                    <p className="text-[9px] font-bold text-textColor/40 uppercase tracking-tighter opacity-70">
                                        {isPos ? 'receives' : isNeg ? 'owes' : 'balanced'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Settlement Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-textColor/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                        {/* Modal Header */}
                        <div className="bg-primary px-8 py-8 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-card/10 rounded-full -mr-16 -mt-16" />
                            <div className="relative z-10">
                                <h3 className="text-white font-black uppercase text-xs tracking-widest opacity-90">Confirm Settlement</h3>
                                <p className="text-[10px] font-medium text-white/50 mt-1 uppercase tracking-tighter">Recording payment details</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-card/10 rounded-2xl transition text-white relative z-10"
                            >
                                <MdClose className="text-2xl" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-8">
                            <div className="text-center py-4 bg-background rounded-[32px] border border-background shadow-inner">
                                <p className="text-[10px] font-black text-textColor/50 uppercase tracking-widest mb-2 leading-none">
                                    Final Amount to {selectedSettlement?.to.name}
                                </p>
                                <h2 className="text-4xl font-black text-textColor tracking-tighter">
                                    ₹{selectedSettlement?.amount.toLocaleString()}
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-textColor/50 uppercase tracking-widest px-1">
                                    Payment Method
                                </label>
                                <div className="grid grid-cols-1 gap-2.5">
                                    {['cash', 'upi', 'bank_transfer'].map(method => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`w-full px-6 py-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between ${
                                                paymentMethod === method
                                                    ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/5'
                                                    : 'border-background text-textColor/60 hover:border-primary/20 bg-background/50'
                                                }`}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                {method.replace('_', ' ')}
                                            </span>
                                            {paymentMethod === method && (
                                                <MdCheckCircle className="text-primary text-xl animate-in zoom-in" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleMarkAsPaid}
                                className="w-full py-5 bg-primary text-white rounded-[32px] font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                <MdCheckCircle className="text-xl" /> Finalize Settlement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settlement;