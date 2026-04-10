import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext, API } from '../context/AuthContext';
import {
    MdNotificationsActive, MdClose, MdWarning, MdPayment,
    MdGroup, MdCheckCircle, MdInfoOutline, MdAttachMoney,
    MdNotificationsNone, MdDelete, MdRefresh
} from 'react-icons/md';
import { toast } from 'react-toastify';

const Alerts = () => {
    const {
        notifications, loading, fetchNotifications,
        markAsRead, markAllAsRead,
        deleteNotification, clearAllNotifications
    } = useContext(AuthContext);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleClearAll = async () => {
        if (!window.confirm('Are you sure you want to clear all notifications?')) return;
        await clearAllNotifications();
        toast.success('All notifications cleared');
    };

    const handleDelete = async (id) => {
        await deleteNotification(id);
        toast.success('Notification removed');
    };

    const handleMarkAsRead = async (id) => {
        await markAsRead(id);
        toast.success('Notification marked as read');
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        toast.success('All notifications marked as read');
    };

    const getAlertConfig = (type) => {
        const configs = {
            BUDGET_EXCEEDED: {
                icon: MdWarning,
                bg: 'bg-red-50',
                border: 'border-red-300',
                text: 'text-red-800',
                iconColor: 'text-red-600',
                label: 'Budget Exceeded'
            },
            SETTLEMENT_PENDING: {
                icon: MdPayment,
                bg: 'bg-yellow-50',
                border: 'border-yellow-300',
                text: 'text-yellow-800',
                iconColor: 'text-yellow-600',
                label: 'Payment Due'
            },
            GROUP_EXPENSE: {
                icon: MdGroup,
                bg: 'bg-blue-50',
                border: 'border-blue-300',
                text: 'text-blue-800',
                iconColor: 'text-blue-600',
                label: 'Group Activity'
            },
            PAYMENT_RECEIVED: {
                icon: MdCheckCircle,
                bg: 'bg-green-50',
                border: 'border-green-300',
                text: 'text-green-800',
                iconColor: 'text-green-600',
                label: 'Payment Received'
            },
            BUDGET_WARNING: {
                icon: MdWarning,
                bg: 'bg-orange-50',
                border: 'border-orange-300',
                text: 'text-orange-800',
                iconColor: 'text-orange-600',
                label: 'Budget Warning'
            },
            OVERSPENDING_WARNING: {
                icon: MdWarning,
                bg: 'bg-orange-50',
                border: 'border-orange-300',
                text: 'text-orange-800',
                iconColor: 'text-orange-600',
                label: 'Overspending Alert'
            },
            RECURRING_SUBSCRIPTION: {
                icon: MdAttachMoney,
                bg: 'bg-blue-50',
                border: 'border-blue-300',
                text: 'text-blue-800',
                iconColor: 'text-blue-600',
                label: 'Subscription Reminder'
            },
            INFO: {
                icon: MdInfoOutline,
                bg: 'bg-gray-50',
                border: 'border-gray-300',
                text: 'text-gray-700',
                iconColor: 'text-gray-600',
                label: 'Information'
            }
        };
        return configs[type] || configs.INFO;
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const filteredNotifications = filter === 'all'
        ? notifications
        : filter === 'unread'
            ? notifications.filter(n => !n.read)
            : notifications;

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                <div className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <MdNotificationsActive className="w-6 h-6 text-blue-600" />
                        </div>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-sm text-gray-600 mt-0.5">Stay updated with your financial activity</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                        >
                            <MdCheckCircle className="text-sm" />
                            Mark all read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                            <MdDelete className="text-sm" />
                            Clear all
                        </button>
                    )}
                    <button
                        onClick={fetchNotifications}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                        <MdRefresh className="text-sm" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition ${filter === 'all'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                >
                    All ({notifications.length})
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition ${filter === 'unread'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                >
                    Unread ({unreadCount})
                </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MdNotificationsNone className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No Notifications</h3>
                        <p className="text-gray-600 text-sm mt-1">
                            {filter === 'unread' ? "You've read all your notifications!" : "You're all caught up!"}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notification, idx) => {
                        const config = getAlertConfig(notification.type);
                        const Icon = config.icon;
                        const isUnread = !notification.read;

                        return (
                            <div
                                key={notification._id || idx}
                                className={`${config.bg} rounded-lg border-l-4 ${config.border} shadow-sm ${isUnread ? 'ring-1 ring-blue-200' : ''}`}
                            >
                                <div className="p-4 flex items-start gap-3">
                                    {/* Icon */}
                                    <div className={`p-2 rounded-lg ${config.bg} border ${config.border} shrink-0`}>
                                        <Icon className={`w-5 h-5 ${config.iconColor}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.text} border ${config.border}`}>
                                                {config.label}
                                            </span>
                                            {isUnread && (
                                                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                                    New
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-500">
                                                {new Date(notification.createdAt).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <p className={`text-sm ${config.text} leading-relaxed`}>
                                            {notification.message}
                                        </p>

                                        {/* Details Section */}
                                        {notification.details && notification.details.length > 0 && (
                                            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                                                <p className="text-xs font-medium text-gray-600 mb-2">Details:</p>
                                                <ul className="space-y-1">
                                                    {notification.details.map((d, i) => (
                                                        <li key={i} className="text-xs text-gray-700 flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                                            {d._id?.category}: ₹{d._id?.amount} ({d.count} times)
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-1 shrink-0">
                                        {isUnread && (
                                            <button
                                                onClick={() => handleMarkAsRead(notification._id)}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="Mark as read"
                                            >
                                                <MdCheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(notification._id)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Dismiss"
                                        >
                                            <MdClose className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Alerts;