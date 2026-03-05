import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { MdHandshake, MdAccountBalanceWallet } from 'react-icons/md';

const Settlement = () => {
    const { selectedGroupId } = useContext(AuthContext);
    const [settlements, setSettlements] = useState(null);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!selectedGroupId) return;

        const fetchData = async () => {
            try {
                const [groupRes, settleRes] = await Promise.all([
                    api.get(`/groups/${selectedGroupId}`),
                    api.get(`/group-expenses/${selectedGroupId}/settlements`)
                ]);
                setGroupData(groupRes.data);
                setSettlements(settleRes.data);
            } catch (error) {
                toast.error("Failed to load settlements");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedGroupId]);

    if (!selectedGroupId) {
        return <div className="p-8 text-center bg-white rounded-xl shadow mt-8">Please select a group first.</div>;
    }

    if (loading) return <div className="p-8">Loading settlements...</div>;

    const { balances, simplifiedDebts } = settlements || { balances: [], simplifiedDebts: [] };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{groupData?.name} - Settlement</h1>

            <div className="bg-white rounded-xl shadow p-6 border-t-4 border-indigo-500">
                <h3 className="text-lg font-semibold mb-6 flex items-center">
                    <MdHandshake className="text-indigo-600 mr-2 w-6 h-6" /> Who Owes Whom
                </h3>

                {simplifiedDebts.length === 0 ? (
                    <div className="text-center py-8">
                        <MdAccountBalanceWallet className="w-16 h-16 text-green-300 mx-auto mb-4" />
                        <h4 className="text-xl font-medium text-gray-800">All Settled Up!</h4>
                        <p className="text-gray-500 mt-2">There are no outstanding balances in this group.</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-2xl mx-auto">
                        {simplifiedDebts.map((debt, index) => (
                            <div key={index} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center space-x-4 w-full sm:w-auto mb-2 sm:mb-0">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-700">
                                        {debt.from.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900">{debt.from.name}</span>
                                        <span className="text-xs text-gray-500">Owes</span>
                                    </div>
                                </div>

                                <div className="hidden sm:flex flex-1 items-center justify-center px-4">
                                    <div className="h-px bg-gray-300 flex-1"></div>
                                    <span className="font-bold text-indigo-700 px-3 bg-white border border-indigo-100 rounded-full text-sm">₹{debt.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                    <div className="h-px bg-gray-300 flex-1 relative">
                                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-gray-300 rotate-45"></div>
                                    </div>
                                </div>
                                <div className="sm:hidden font-bold text-indigo-700 w-full text-center py-2">
                                    ₹{debt.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </div>

                                <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
                                    <div className="flex flex-col text-right">
                                        <span className="font-semibold text-gray-900">{debt.to.name}</span>
                                        <span className="text-xs text-gray-500">Receives</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                                        {debt.to.name.charAt(0)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Individual Balances</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {balances.map((bal, idx) => {
                        const amount = bal.balance;
                        const isPositive = amount > 0.01;
                        const isNegative = amount < -0.01;

                        return (
                            <div key={idx} className={`p-4 rounded-lg flex justify-between items-center ${isPositive ? 'bg-green-50 border border-green-100' : isNegative ? 'bg-red-50 border border-red-100' : 'bg-gray-50 border border-gray-100'}`}>
                                <span className="font-medium">{bal.memberInfo.name}</span>
                                <span className={`font-bold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
                                    {isPositive ? '+' : ''}{amount === 0 ? 'Settled' : `₹${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Settlement;
