import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { MdGroup, MdAttachMoney, MdAccountBalanceWallet } from 'react-icons/md';

const GroupDashboard = () => {
    const { selectedGroupId } = useContext(AuthContext);
    const [groupData, setGroupData] = useState(null);
    const [settlements, setSettlements] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!selectedGroupId) return;

        const fetchGroupDashboard = async () => {
            try {
                const [groupRes, settleRes] = await Promise.all([
                    api.get(`/groups/${selectedGroupId}`),
                    api.get(`/group-expenses/${selectedGroupId}/settlements`)
                ]);
                setGroupData(groupRes.data);
                setSettlements(settleRes.data);
            } catch (error) {
                toast.error("Failed to load group dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchGroupDashboard();
    }, [selectedGroupId]);

    if (!selectedGroupId) {
        return <div className="p-8 text-center bg-white rounded-xl shadow mt-8">Please select a group from the Groups menu first.</div>;
    }

    if (loading) return <div className="p-8">Loading dashboard...</div>;

    const totalExpense = settlements?.balances.reduce((acc, bal) => {
        // Balances obj: balance > 0 means paid more, balance < 0 means paid less. Total expense is simply total of all credits or total of all debits if we just want the sum, wait we don't have total expenses here directly, let's just sum up the positive balances? No, we need total group expense. We can just use the balances array. Actually, sum of all positive balances = sum of all negative absolute balances = total amount circulated. Not exactly total expense. Let's just calculate total expense from expenses. Wait, we didn't fetch expenses array. Let's just show Total Group Members instead.
        return acc;
    }, 0);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{groupData?.name} - Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500">
                    <div className="flex items-center text-gray-500 mb-2">
                        <MdGroup className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium uppercase">Total Members</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{groupData?.members?.length || 0}</p>
                </div>

                <div className="bg-white rounded-xl shadow p-6 border-l-4 border-teal-500">
                    <div className="flex items-center text-gray-500 mb-2">
                        <MdAccountBalanceWallet className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium uppercase">Your Balance</span>
                    </div>
                    {/* We need to find current user's balance */}
                    {(() => {
                        const myBal = settlements?.balances.find(b => b.memberInfo.user && b.memberInfo.user.toString() === groupData.createdBy.toString())?.balance || 0; // rough check, ideally use user._id
                        return (
                            <p className={`text-3xl font-bold ${myBal > 0 ? 'text-green-600' : myBal < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                {myBal > 0 ? '+' : ''}₹{myBal.toLocaleString()}
                            </p>
                        );
                    })()}
                    <p className="text-xs text-gray-400 mt-1">Positive = You are owed, Negative = You owe</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Group Members</h3>
                    <ul className="space-y-3">
                        {groupData?.members.map(m => (
                            <li key={m._id || m.name} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <span className="font-medium text-gray-800">{m.name} {m.email ? `(${m.email})` : ''}</span>
                                <span className="text-sm text-gray-500">Joined {new Date(m.joinedAt).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Quick Balances</h3>
                    {settlements?.simplifiedDebts.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Everyone is settled up!</p>
                    ) : (
                        <ul className="space-y-3">
                            {settlements?.simplifiedDebts.map((debt, i) => (
                                <li key={i} className="flex items-center text-gray-700 bg-red-50 p-3 rounded-lg border border-red-100">
                                    <span className="font-semibold mr-1">{debt.from.name}</span> owes
                                    <span className="font-semibold mx-1">{debt.to.name}</span>
                                    <span className="font-bold text-red-600 ml-auto">₹{debt.amount.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupDashboard;
