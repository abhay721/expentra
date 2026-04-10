import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { MdArrowBack, MdCalculate, MdCheckCircle, MdReceipt, MdCategory, MdEdit } from 'react-icons/md';

const AddGroupExpense = () => {
    const navigate = useNavigate();
    const { expenseId } = useParams();
    const isEditMode = !!expenseId;
    const { selectedGroupId } = useContext(AuthContext);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('General');
    const [note, setNote] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const [paidBy, setPaidBy] = useState([]);
    const [splitType, setSplitType] = useState('equal');
    const [splitDetails, setSplitDetails] = useState([]);

    useEffect(() => {
        if (!selectedGroupId) {
            navigate('/groups');
            return;
        }

        const fetchData = async () => {
            try {
                const groupRes = await axios.get(`${API}/groups/${selectedGroupId}`);
                const group = groupRes.data;
                setGroupData(group);

                let initialSplit = [];
                let initialPaidBy = [];

                if (isEditMode) {
                    const expensesRes = await axios.get(`${API}/group-expenses/${selectedGroupId}`);
                    const expense = expensesRes.data.find(e => e._id === expenseId);
                    if (!expense) {
                        toast.error("Expense not found");
                        navigate('/groups/expenses');
                        return;
                    }

                    setTitle(expense.title);
                    setAmount(expense.amount);
                    setCategory(expense.category || 'General');
                    setNote(expense.note || '');
                    setDate(format(new Date(expense.date), 'yyyy-MM-dd'));
                    setSplitType(expense.splitType || 'equal');

                    initialPaidBy = expense.paidBy.map(p => {
                        const member = group.members.find(m =>
                            (m.user && p.user && m.user.toString() === p.user.toString()) ||
                            m.name === p.name
                        );
                        return {
                            mid: member ? member._id : null,
                            user: p.user,
                            name: p.name,
                            amount: p.amount
                        };
                    });

                    initialSplit = group.members.map(m => {
                        const savedSplit = expense.splitDetails.find(s =>
                            (s.user && m.user && s.user.toString() === m.user.toString()) ||
                            s.name === m.name
                        );
                        return {
                            mid: m._id,
                            user: m.user,
                            name: m.name,
                            share: savedSplit ? savedSplit.share : 0,
                            involved: !!savedSplit
                        };
                    });
                } else {
                    initialSplit = group.members.map(m => ({
                        mid: m._id,
                        user: m.user,
                        name: m.name,
                        share: 0,
                        involved: true
                    }));
                }

                setSplitDetails(initialSplit);
                setPaidBy(initialPaidBy);
                setLoading(false);
            } catch (error) {
                toast.error("Failed to load data");
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedGroupId, navigate, expenseId, isEditMode]);

    const handleInvolvementToggle = (mId) => {
        setSplitDetails(splitDetails.map(item =>
            item.mid === mId ? { ...item, involved: !item.involved } : item
        ));
    };

    const handleShareChange = (mId, value) => {
        setSplitDetails(splitDetails.map(item =>
            item.mid === mId ? { ...item, share: Number(value) } : item
        ));
    };

    const handlePayerChange = (mId, name, userId, value) => {
        const val = Number(value);
        if (val === 0) {
            setPaidBy(paidBy.filter(p => p.mid !== mId));
            return;
        }

        const existing = paidBy.find(p => p.mid === mId);
        if (existing) {
            setPaidBy(paidBy.map(p => p.mid === mId ? { ...p, amount: val } : p));
        } else {
            setPaidBy([...paidBy, { mid: mId, user: userId, name, amount: val }]);
        }
    };

    const validateAndCalculate = () => {
        if (!title || !amount || Number(amount) <= 0) {
            toast.error("Please enter a valid title and amount");
            return false;
        }

        const totalPaid = paidBy.reduce((sum, p) => sum + p.amount, 0);
        if (Math.abs(totalPaid - Number(amount)) > 0.01) {
            toast.error(`Total paid (₹${totalPaid}) must equal expense amount (₹${amount})`);
            return false;
        }

        const involvedMembers = splitDetails.filter(s => s.involved);
        if (involvedMembers.length === 0) {
            toast.error("At least one member must be involved");
            return false;
        }

        if (splitType === 'exact') {
            const totalShare = involvedMembers.reduce((sum, s) => sum + s.share, 0);
            if (Math.abs(totalShare - Number(amount)) > 0.1) {
                toast.error("Exact shares must equal total amount");
                return false;
            }
        } else if (splitType === 'percentage') {
            const totalPct = involvedMembers.reduce((sum, s) => sum + s.share, 0);
            if (Math.abs(totalPct - 100) > 0.1) {
                toast.error("Percentages must total 100%");
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateAndCalculate()) return;

        try {
            const finalSplitDetails = splitDetails.filter(s => s.involved).map(s => ({
                user: (s.user && typeof s.user === 'string' && s.user.length === 24) ? s.user : null,
                name: s.name,
                share: s.share
            }));

            const finalPaidBy = paidBy.map(p => ({
                user: (p.user && typeof p.user === 'string' && p.user.length === 24) ? p.user : null,
                name: p.name,
                amount: p.amount
            }));

            const payload = {
                groupId: selectedGroupId,
                title,
                amount: Number(amount),
                paidBy: finalPaidBy,
                splitType,
                splitDetails: finalSplitDetails,
                category,
                note,
                date: new Date(date)
            };

            if (isEditMode) {
                await axios.put(`${API}/group-expenses/${selectedGroupId}/${expenseId}`, payload);
                toast.success("Expense updated successfully");
            } else {
                await axios.post(`${API}/group-expenses`, payload);
                toast.success("Expense added successfully");
            }

            navigate('/groups/expenses');
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} expense`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-textColor opacity-70 text-lg font-medium">Loading...</div>
            </div>
        );
    }

    const involvedCount = splitDetails.filter(s => s.involved).length;
    const totalPaid = paidBy.reduce((s, p) => s + p.amount, 0);
    const isPaidCorrect = Math.abs(totalPaid - Number(amount)) < 0.01;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card px-6 py-5 shadow-sm border-b border-background">
                <div className="max-w-6xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => navigate('/groups/expenses')}
                        className="p-2 rounded-xl bg-background hover:bg-primary hover:text-card transition-colors text-textColor"
                    >
                        <MdArrowBack className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-textColor text-xl font-bold leading-tight">
                            {isEditMode ? 'Edit Expense' : 'Add Group Expense'}
                        </h1>
                        <p className="text-textColor opacity-70 text-sm mt-0.5">{groupData?.name || 'Group'}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column - Forms */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Basic Info */}
                        <div className="bg-card rounded-2xl shadow-sm border border-background p-6">
                            <h2 className="text-textColor font-bold text-sm uppercase tracking-widest flex items-center gap-2 mb-5">
                                <MdReceipt className="text-primary" /> Expense Info
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-textColor mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="e.g. Pizza Night"
                                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-background focus:outline-none focus:border-primary text-textColor text-sm transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-textColor mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-background focus:outline-none focus:border-primary text-textColor font-bold text-base transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Paid By */}
                        <div className="bg-card rounded-2xl shadow-sm border border-background p-6">
                            <h2 className="text-textColor font-bold text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-primary text-card text-xs flex items-center justify-center font-bold">1</span>
                                Who Paid?
                            </h2>

                            <div className="space-y-3">
                                {groupData?.members.map(m => {
                                    const payer = paidBy.find(p => p.mid === m._id);
                                    return (
                                        <div key={m._id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-background border border-background">
                                            <span className="text-textColor font-medium text-sm">{m.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-primary text-sm font-semibold">₹</span>
                                                <input
                                                    type="number"
                                                    value={payer ? payer.amount : ''}
                                                    onChange={e => handlePayerChange(m._id, m.name, m.user, e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-28 px-3 py-1.5 rounded-lg bg-card border border-background focus:outline-none focus:border-primary text-right text-sm text-textColor transition-colors"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Split Method */}
                        <div className="bg-card rounded-2xl shadow-sm border border-background p-6">
                            <h2 className="text-textColor font-bold text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-primary text-card text-xs flex items-center justify-center font-bold">2</span>
                                Split Method
                            </h2>

                            <div className="flex gap-2 mb-5">
                                {['equal', 'exact', 'percentage'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setSplitType(type)}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-bold capitalize transition-colors border ${splitType === type
                                            ? 'bg-primary text-card border-primary'
                                            : 'bg-card text-textColor border-background hover:border-primary'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                {splitDetails.map(m => (
                                    <div
                                        key={m.mid}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${m.involved
                                            ? 'bg-background border-background'
                                            : 'bg-card border-background opacity-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={m.involved}
                                                onChange={() => handleInvolvementToggle(m.mid)}
                                                className="w-4 h-4 accent-primary rounded"
                                            />
                                            <span className={`text-sm font-semibold ${m.involved ? 'text-textColor' : 'text-textColor opacity-70'}`}>
                                                {m.name}
                                            </span>
                                        </div>

                                        {m.involved && (
                                            <div className="flex items-center gap-2">
                                                {splitType === 'equal' ? (
                                                    <span className="text-primary font-bold text-sm bg-card px-3 py-1.5 rounded-lg border border-background">
                                                        ₹{(Number(amount) / involvedCount || 0).toFixed(2)}
                                                    </span>
                                                ) : (
                                                    <>
                                                        <span className="text-primary font-medium text-sm">
                                                            {splitType === 'percentage' ? '%' : '₹'}
                                                        </span>
                                                        <input
                                                            type="number"
                                                            value={m.share || ''}
                                                            onChange={e => handleShareChange(m.mid, e.target.value)}
                                                            placeholder="0"
                                                            className="w-24 px-3 py-1.5 rounded-lg bg-card border border-background focus:outline-none focus:border-primary text-right text-sm text-textColor transition-colors"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Summary & Details */}
                    <div className="space-y-6">

                        {/* Summary Card */}
                        <div className="bg-primary rounded-2xl p-6 shadow-sm text-card">
                            <h3 className="font-bold text-sm uppercase tracking-widest mb-5 flex items-center gap-2">
                                <MdCalculate /> Summary
                            </h3>

                            <div className="space-y-4 text-card opacity-90 text-sm mb-6">
                                <div className="flex justify-between border-b border-card pb-2">
                                    <span>Total Amount</span>
                                    <span className="font-bold text-lg">₹{amount || '0.00'}</span>
                                </div>
                                <div className="flex justify-between border-b border-card pb-2">
                                    <span>Total Paid</span>
                                    <span className={`font-bold ${isPaidCorrect ? 'text-card' : 'text-red-300'}`}>
                                        ₹{totalPaid.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Splitting Between</span>
                                    <span className="font-bold">{involvedCount} members</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                className="w-full py-3 bg-card text-primary hover:bg-background rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                            >
                                {isEditMode ? <MdEdit className="text-lg" /> : <MdCheckCircle className="text-lg" />}
                                {isEditMode ? 'Update Expense' : 'Save Expense'}
                            </button>
                        </div>

                        {/* Details */}
                        <div className="bg-card rounded-2xl shadow-sm border border-background p-6 space-y-5">
                            <h4 className="text-textColor font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                                <MdCategory className="text-primary" /> Details
                            </h4>

                            <div>
                                <label className="block text-xs font-semibold text-textColor mb-1">Category</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-background focus:outline-none focus:border-primary text-textColor text-sm transition-colors"
                                >
                                    {['General', 'Food', 'Travel', 'Entertainment', 'Shopping', 'Household'].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-textColor mb-1">Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-background focus:outline-none focus:border-primary text-textColor text-sm transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-textColor mb-1">Notes</label>
                                <textarea
                                    rows={3}
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    placeholder="Extra details..."
                                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-background focus:outline-none focus:border-primary text-textColor text-sm resize-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddGroupExpense;