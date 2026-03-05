import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { MdGroupAdd, MdPerson } from 'react-icons/md';

const Members = () => {
    const { selectedGroupId } = useContext(AuthContext);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchGroupData = async () => {
        try {
            const res = await api.get(`/groups/${selectedGroupId}`);
            setGroupData(res.data);
        } catch (error) {
            toast.error("Failed to load group members");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedGroupId) return;
        fetchGroupData();
    }, [selectedGroupId]);

    const handleAddMember = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            return toast.error("Name is required");
        }

        setIsSubmitting(true);
        try {
            await api.put(`/groups/${selectedGroupId}/members`, {
                name: name.trim(),
                email: email.trim() || undefined
            });

            toast.success(`${name} added to the group!`);
            setName('');
            setEmail('');

            // Refresh member list
            await fetchGroupData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add member");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!selectedGroupId) {
        return <div className="p-8 text-center bg-white rounded-xl shadow mt-8">Please select a group first.</div>;
    }

    if (loading) return <div className="p-8">Loading members...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{groupData?.name} - Members</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Add Member Form */}
                <div className="md:col-span-1 border border-indigo-100 bg-white rounded-xl shadow-sm p-6 self-start text-sm">
                    <h2 className="text-base font-semibold mb-4 flex items-center text-indigo-900 border-b pb-2">
                        <MdGroupAdd className="mr-2 w-5 h-5 text-indigo-500" />
                        Add New Member
                    </h2>

                    <form onSubmit={handleAddMember} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder="e.g. John Doe"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Email <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder="john@example.com"
                            />
                            <p className="text-xs text-gray-500 mt-1">Providing an email allows linking to a registered account if it exists.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors
                                ${isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            {isSubmitting ? 'Adding...' : 'Add Member'}
                        </button>
                    </form>
                </div>

                {/* Member List */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-sm">
                    <h2 className="text-base font-semibold mb-4 text-gray-800 border-b pb-2">
                        Current Group Members ({groupData?.members?.length || 0})
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        {groupData?.members.map(member => (
                            <div key={member.user || member.name} className="flex items-center p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-white transition hover:shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3 shrink-0">
                                    {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="truncate">
                                    <p className="font-semibold text-gray-900 truncate" title={member.name}>
                                        {member.name}
                                        {groupData.createdBy.toString() === (member.user && member.user.toString()) && (
                                            <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wide">Admin</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate" title={member.email || 'Unregistered User'}>
                                        {member.email || 'Unregistered User'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Members;
