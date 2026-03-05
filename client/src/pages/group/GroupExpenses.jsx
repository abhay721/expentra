import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { MdAdd } from 'react-icons/md';

const GroupExpenses = () => {
    const { selectedGroupId, user } = useContext(AuthContext);
    const [expenses, setExpenses] = useState([]);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [splitType, setSplitType] = useState('equal'); // 'equal', 'exact'
    const [splitAmounts, setSplitAmounts] = useState({});

    useEffect(() => {
        if (!selectedGroupId) return;

        const fetchData = async () => {
            try {
                const [expRes, groupRes] = await Promise.all([
                    api.get(`/group-expenses/${selectedGroupId}`),
                    api.get(`/groups/${selectedGroupId}`)
                ]);
                setExpenses(expRes.data);
                setGroupData(groupRes.data);
                if (groupRes.data.members.length > 0) {
                    setPaidBy(groupRes.data.members[0].user || groupRes.data.members[0]._id);
                }
            } catch (error) {
                toast.error("Failed to load expenses");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedGroupId]);

    // Handle split logic updates
    useEffect(() => {
        if (splitType === 'equal' && amount && groupData?.members?.length > 0) {
            const numMembers = groupData.members.length;
            const splitAmt = (Number(amount) / numMembers).toFixed(2);

            const newSplits = {};
            groupData.members.forEach(m => {
                newSplits[m.user ? m.user.toString() : m.name] = Number(splitAmt);
            });
            setSplitAmounts(newSplits);
        }
    }, [amount, splitType, groupData]);

    const handleSplitChange = (identifier, val) => {
        setSplitAmounts({
            ...splitAmounts,
            [identifier]: Number(val)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate total split if exact
        if (splitType === 'exact') {
            const totalSplit = Object.values(splitAmounts).reduce((a, b) => a + Number(b), 0);
            if (Math.abs(totalSplit - Number(amount)) > 0.1) {
                return toast.error("Split amounts must equal total amount");
            }
        }

        const splitBetween = groupData.members.map(m => {
            const id = m.user ? m.user.toString() : m.name;
            return {
                user: m.user || null,
                name: m.name,
                amount: splitAmounts[id] || 0
            };
        });

        try {
            const res = await api.post('/group-expenses', {
                groupId: selectedGroupId,
                title,
                amount: Number(amount),
                paidBy,
                splitBetween
            });
            setExpenses([res.data, ...expenses]);
            setShowForm(false);
            setTitle('');
            setAmount('');
            toast.success("Expense added successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add expense");
        }
    };

    if (!selectedGroupId) {
        return <div className="p-8 text-center bg-white rounded-xl shadow mt-8">Please select a group first.</div>;
    }

    if (loading) return <div className="p-8">Loading expenses...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{groupData?.name} - Expenses</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <MdAdd className="mr-2" /> {showForm ? 'Cancel' : 'Add Expense'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow border border-indigo-100">
                    <h2 className="text-lg font-semibold mb-4">Add New Group Expense</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500" placeholder="e.g. Dinner at Taj" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹)</label>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Paid By</label>
                            <select value={paidBy} onChange={e => setPaidBy(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500">
                                {groupData?.members.map(m => (
                                    <option key={m.user || m.name} value={m.user || m._id}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Split Options</label>
                            <div className="flex gap-4 mb-4">
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" checked={splitType === 'equal'} onChange={() => setSplitType('equal')} className="mr-2" />
                                    Split Equally
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" checked={splitType === 'exact'} onChange={() => setSplitType('exact')} className="mr-2" />
                                    Split Exact Amounts
                                </label>
                            </div>

                            {amount > 0 && (
                                <div className="space-y-2 border-t pt-4">
                                    {groupData?.members.map(m => {
                                        const id = m.user ? m.user.toString() : m.name;
                                        return (
                                            <div key={id} className="flex justify-between items-center">
                                                <span className="text-sm font-medium">{m.name}</span>
                                                <div className="flex items-center">
                                                    <span className="mr-2 text-gray-500">₹</span>
                                                    <input
                                                        type="number"
                                                        value={splitAmounts[id] || ''}
                                                        onChange={(e) => handleSplitChange(id, e.target.value)}
                                                        disabled={splitType === 'equal'}
                                                        className={`w-24 px-2 py-1 border rounded ${splitType === 'equal' ? 'bg-gray-100' : 'bg-white'}`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Save Expense</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow overflow-hidden tracking-wide text-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-4 font-semibold text-gray-700">Date</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Title</th>
                            <th className="px-6 py-4 font-semibold text-gray-700">Paid By</th>
                            <th className="px-6 py-4 font-semibold text-gray-700 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.map(exp => (
                            <tr key={exp._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td className="px-6 py-4 text-gray-500">{new Date(exp.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{exp.title}</td>
                                <td className="px-6 py-4 text-gray-600">
                                    {/* Map paidBy ID back to member name */}
                                    {groupData?.members.find(m => m.user?.toString() === exp.paidBy?.toString() || m._id?.toString() === exp.paidBy?.toString())?.name || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-gray-900">₹{exp.amount.toLocaleString()}</td>
                            </tr>
                        ))}
                        {expenses.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No expenses added yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GroupExpenses;
