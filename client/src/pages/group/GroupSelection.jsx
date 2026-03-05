import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { MdAdd, MdGroup } from 'react-icons/md';
import { toast } from 'react-toastify';

const GroupSelection = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const { setAppMode, setSelectedGroupId } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await api.get('/groups');
                setGroups(res.data);
            } catch (error) {
                console.error("Error fetching groups", error);
                toast.error("Failed to load groups");
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/groups', { name: newGroupName });
            setGroups([res.data, ...groups]);
            setNewGroupName('');
            setShowCreateForm(false);
            toast.success("Group created successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create group");
        }
    };

    const handleSelectGroup = (groupId) => {
        setSelectedGroupId(groupId);
        setAppMode('group');
        navigate('/groups/dashboard');
    };

    if (loading) return <div className="p-8">Loading groups...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Your Groups</h1>
                    <p className="text-gray-600 mt-2">Select a group to manage shared expenses or create a new one.</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <MdAdd className="mr-2" /> {showCreateForm ? 'Cancel' : 'Create Group'}
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
                    <form onSubmit={handleCreateGroup} className="flex gap-4">
                        <input
                            type="text"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="e.g. Goa Trip, Apartment Rent"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                            Save
                        </button>
                    </form>
                </div>
            )}

            {groups.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                    <MdGroup className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No groups yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">Create your first group to start splitting expenses with friends or roommates.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map(group => (
                        <div
                            key={group._id}
                            onClick={() => handleSelectGroup(group._id)}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all"
                        >
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-4">
                                    <MdGroup className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{group.name}</h3>
                                    <p className="text-sm text-gray-500">{group.members?.length || 1} Members</p>
                                </div>
                            </div>
                            <div className="text-sm text-indigo-600 font-medium">
                                Open Group &rarr;
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GroupSelection;
