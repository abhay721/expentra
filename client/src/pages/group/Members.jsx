import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
    MdGroupAdd, MdPerson, MdEdit, MdDelete, MdCheck, MdClose,
    MdContentCopy, MdEmail, MdPeople, MdAdminPanelSettings,
    MdInfoOutline, MdLink
} from 'react-icons/md';

const Members = () => {
    const { selectedGroupId, user } = useContext(AuthContext);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [editingMemberId, setEditingMemberId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');

    const isAdmin = groupData && user && groupData.createdBy?.toString() === user._id?.toString();

    const fetchGroupData = async () => {
        try {
            const res = await axios.get(`${API}/groups/${selectedGroupId}`);
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
            toast.error("Name is required");
            return;
        }
        setIsSubmitting(true);
        try {
            await axios.put(`${API}/groups/${selectedGroupId}/members`, {
                name: name.trim(),
                email: email.trim() || undefined
            });
            toast.success(`${name} added to the group!`);
            setName('');
            setEmail('');
            await fetchGroupData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add member");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateMember = async (memberId) => {
        if (!editName.trim()) {
            toast.error("Name is required");
            return;
        }
        setIsSubmitting(true);
        try {
            await axios.put(`${API}/groups/${selectedGroupId}/members/${memberId}`, {
                name: editName.trim(),
                email: editEmail.trim() || ''
            });
            toast.success("Member updated");
            setEditingMemberId(null);
            await fetchGroupData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMember = async (memberId, memberName) => {
        if (!window.confirm(`Are you sure you want to remove ${memberName} from the group?`)) return;
        try {
            await axios.delete(`${API}/groups/${selectedGroupId}/members/${memberId}`);
            toast.success("Member removed");
            await fetchGroupData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Delete failed");
        }
    };

    const startEditing = (member) => {
        setEditingMemberId(member._id);
        setEditName(member.name);
        setEditEmail(member.email || '');
    };

    const copyToClipboard = (text, message) => {
        navigator.clipboard.writeText(text);
        toast.success(message);
    };

    if (!selectedGroupId) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MdPeople className="w-8 h-8 text-gray-400" />
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
                    <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
                        <div className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
                        <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{groupData?.name}</h1>
                <p className="text-gray-600 text-sm mt-1">Manage group members and invitations</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Invite Options Card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <MdGroupAdd className="w-5 h-5 text-blue-600" />
                            <h2 className="font-semibold text-gray-900">Invite Options</h2>
                        </div>
                    </div>
                    <div className="p-5 space-y-4">
                        {/* Invite Code */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Invite Code
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-50 px-3 py-2 rounded-lg font-mono text-base font-bold text-center border border-gray-200">
                                    {groupData?.inviteCode || 'N/A'}
                                </div>
                                <button
                                    onClick={() => copyToClipboard(groupData?.inviteCode, "Invite code copied!")}
                                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                    title="Copy Code"
                                >
                                    <MdContentCopy className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Invite Link */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Invite Link
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-50 px-3 py-2 rounded-lg text-xs truncate border border-gray-200 text-gray-600">
                                    {groupData?.inviteLink || 'N/A'}
                                </div>
                                <button
                                    onClick={() => copyToClipboard(groupData?.inviteLink, "Invite link copied!")}
                                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                    title="Copy Link"
                                >
                                    <MdLink className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Share this link with friends to join the group
                            </p>
                        </div>

                        <button
                            onClick={() => toast.info("Email invitation feature coming soon!")}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                            <MdEmail className="text-sm" />
                            Invite via Email
                        </button>
                    </div>
                </div>

                {/* Add Member Form */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <MdPerson className="w-5 h-5 text-blue-600" />
                            <h2 className="font-semibold text-gray-900">Add Member</h2>
                        </div>
                    </div>
                    <form onSubmit={handleAddMember} className="p-5 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., John Doe"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email <span className="text-gray-500 text-xs font-normal">(optional)</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="john@example.com"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-2 rounded-lg font-medium text-white transition flex items-center justify-center gap-2 ${isSubmitting
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {isSubmitting ? 'Adding...' : <><MdGroupAdd /> Add Member</>}
                        </button>
                    </form>
                </div>

                {/* Member List */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MdPeople className="w-5 h-5 text-blue-600" />
                                <h2 className="font-semibold text-gray-900">Members</h2>
                            </div>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                {groupData?.members?.length || 0}
                            </span>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                        {groupData?.members?.map((member) => {
                            const isCreator = groupData.createdBy?.toString() === (member.user?.toString() || member._id?.toString());
                            const isCurrentUser = user && member.user?.toString() === user._id?.toString();
                            const isEditing = editingMemberId === member._id;

                            return (
                                <div key={member._id} className="p-4 hover:bg-gray-50 transition">
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="Name"
                                                autoFocus
                                            />
                                            <input
                                                type="email"
                                                value={editEmail}
                                                onChange={e => setEditEmail(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="Email"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdateMember(member._id)}
                                                    className="flex-1 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center justify-center gap-1"
                                                >
                                                    <MdCheck /> Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingMemberId(null)}
                                                    className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition flex items-center justify-center gap-1"
                                                >
                                                    <MdClose /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                                    <span className="text-blue-700 font-bold text-sm">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="font-medium text-gray-900 truncate">
                                                            {member.name}
                                                        </p>
                                                        {isCreator && (
                                                            <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                                <MdAdminPanelSettings className="text-xs" /> Admin
                                                            </span>
                                                        )}
                                                        {isCurrentUser && !isCreator && (
                                                            <span className="text-xs font-medium bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {member.email || 'No email provided'}
                                                    </p>
                                                </div>
                                            </div>
                                            {isAdmin && !isCreator && (
                                                <div className="flex gap-1 shrink-0 ml-2">
                                                    <button
                                                        onClick={() => startEditing(member)}
                                                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                        title="Edit"
                                                    >
                                                        <MdEdit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMember(member._id, member.name)}
                                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                        title="Remove"
                                                    >
                                                        <MdDelete className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {groupData?.members?.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                <MdPeople className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No members yet</p>
                                <p className="text-xs mt-1">Add members using the form</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Admin Note */}
            {!isAdmin && (
                <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-3">
                    <div className="flex items-center gap-2">
                        <MdInfoOutline className="w-4 h-4 text-yellow-700" />
                        <p className="text-sm text-yellow-800">
                            Only group admins can add, edit, or remove members.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Members;