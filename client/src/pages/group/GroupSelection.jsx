import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API } from '../../context/AuthContext';
import { MdAdd, MdGroup, MdEdit, MdDelete, MdClose, MdCheck, MdContentCopy, MdPeople, MdCreate, MdLogin } from 'react-icons/md';
import { toast } from 'react-toastify';

const GroupSelection = () => {
    const { inviteCode: urlInviteCode } = useParams();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(urlInviteCode ? 'join' : 'select');
    const [newGroup, setNewGroup] = useState({ name: '', description: '' });
    const [inviteCode, setInviteCode] = useState(urlInviteCode || '');

    const [editingGroup, setEditingGroup] = useState(null);
    const [editData, setEditData] = useState({ name: '', description: '' });

    const { setAppMode, setSelectedGroupId, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGroups();
        if (urlInviteCode) {
            setActiveTab('join');
            setInviteCode(urlInviteCode);
        }
    }, [urlInviteCode]);

    const fetchGroups = async () => {
        try {
            const res = await axios.get(`${API}/groups`);
            setGroups(res.data);
        } catch (error) {
            toast.error("Failed to load groups");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!newGroup.name.trim()) {
            toast.error("Please enter a group name");
            return;
        }
        try {
            const res = await axios.post(`${API}/groups`, newGroup);
            setGroups([res.data, ...groups]);
            setNewGroup({ name: '', description: '' });
            setActiveTab('select');
            toast.success("Group created successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create group");
        }
    };

    const handleJoinGroup = async (e) => {
        e.preventDefault();
        if (!inviteCode.trim()) {
            toast.error("Please enter an invite code");
            return;
        }
        try {
            await axios.post(`${API}/groups/join`, { inviteCode: inviteCode.toUpperCase() });
            setInviteCode('');
            setActiveTab('select');
            fetchGroups();
            toast.success("Joined group successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid invite code");
        }
    };

    const handleSelectGroup = (groupId) => {
        setSelectedGroupId(groupId);
        setAppMode('group');
        navigate('/groups/dashboard');
    };

    const handleUpdateGroup = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`${API}/groups/${editingGroup._id}`, editData);
            setGroups(groups.map(g => g._id === editingGroup._id ? res.data : g));
            setEditingGroup(null);
            toast.success("Group updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update group");
        }
    };

    const handleDeleteGroup = async (groupId, groupName) => {
        if (!window.confirm(`Are you sure you want to delete "${groupName}"?`)) return;
        try {
            await axios.delete(`${API}/groups/${groupId}`);
            setGroups(groups.filter(g => g._id !== groupId));
            toast.success("Group deleted successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete group");
        }
    };

    const startEditing = (e, group) => {
        e.stopPropagation();
        setEditingGroup(group);
        setEditData({ name: group.name, description: group.description || '' });
    };

    const copyInviteCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success("Invite code copied!");
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-lg mb-2">
                    <MdGroup className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Group Mode</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Collaborate, split bills, and track shared expenses with family and friends
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center">
                <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                    <button
                        onClick={() => setActiveTab('select')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === 'select'
                                ? 'bg-white shadow-sm text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <MdGroup /> My Groups
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === 'create'
                                ? 'bg-white shadow-sm text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <MdCreate /> Create Group
                    </button>
                    <button
                        onClick={() => setActiveTab('join')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${activeTab === 'join'
                                ? 'bg-white shadow-sm text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <MdLogin /> Join Group
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div>
                {/* My Groups Tab */}
                {activeTab === 'select' && (
                    <div className="space-y-6">
                        {groups.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MdGroup className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">No groups yet</h3>
                                <p className="text-gray-600 mt-2">Get started by creating or joining a group.</p>
                                <div className="mt-6 flex gap-3 justify-center">
                                    <button
                                        onClick={() => setActiveTab('create')}
                                        className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                                    >
                                        Create Group
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('join')}
                                        className="px-5 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-blue-300 hover:text-blue-600 transition"
                                    >
                                        Join Group
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groups.map((group) => {
                                    const isCreator = user && group.createdBy &&
                                        group.createdBy.toString() === (user._id || user.id).toString();
                                    return (
                                        <div
                                            key={group._id}
                                            onClick={() => handleSelectGroup(group._id)}
                                            className="bg-white rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition overflow-hidden"
                                        >
                                            <div className="p-5">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <MdGroup className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    {isCreator && (
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={(e) => startEditing(e, group)}
                                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                                title="Edit Group"
                                                            >
                                                                <MdEdit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteGroup(group._id, group.name);
                                                                }}
                                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                                title="Delete Group"
                                                            >
                                                                <MdDelete className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{group.name}</h3>
                                                <p className="text-gray-600 text-sm line-clamp-2 min-h-[40px] mb-3">
                                                    {group.description || 'No description provided.'}
                                                </p>
                                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <MdPeople className="text-blue-600" />
                                                        <span>{group.members?.length || 1} members</span>
                                                    </div>
                                                    <div className="text-blue-600 text-sm font-medium">
                                                        Select →
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Create Group Tab */}
                {activeTab === 'create' && (
                    <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <MdCreate className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Create New Group</h2>
                                    <p className="text-sm text-gray-600">Start a new group to track shared expenses</p>
                                </div>
                            </div>
                        </div>
                        <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
                                <input
                                    type="text"
                                    value={newGroup.name}
                                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                    placeholder="e.g., Goa Trip 2024, Roommates"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                <textarea
                                    value={newGroup.description}
                                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                    placeholder="What is this group for?"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows="3"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                            >
                                Create Group
                            </button>
                        </form>
                    </div>
                )}

                {/* Join Group Tab */}
                {activeTab === 'join' && (
                    <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <MdLogin className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Join a Group</h2>
                                    <p className="text-sm text-gray-600">Enter the invite code shared by your friend</p>
                                </div>
                            </div>
                        </div>
                        <form onSubmit={handleJoinGroup} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Invite Code</label>
                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    placeholder="e.g., 8F4K29"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-mono tracking-wider uppercase"
                                    maxLength={6}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1.5 text-center">
                                    Enter the 6-character code exactly as shown
                                </p>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                            >
                                Join Group
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Edit Group</h2>
                            <button
                                onClick={() => setEditingGroup(null)}
                                className="p-1 hover:bg-gray-200 rounded transition text-gray-500 hover:text-gray-700"
                            >
                                <MdClose className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateGroup} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows="3"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingGroup(null)}
                                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupSelection;