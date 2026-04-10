import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    MdDashboard,
    MdAttachMoney,
    MdPieChart,
    MdGroup,
    MdAnalytics,
    MdAdminPanelSettings,
    MdHome,
    MdHandshake,
} from 'react-icons/md';
import { FaMoneyBillWave } from 'react-icons/fa';

const Sidebar = ({ role, isOpen, setIsOpen }) => {
    const location = useLocation();
    const { appMode, setAppMode } = useContext(AuthContext);

    const getNavItems = () => {
        const isAdminPath = location.pathname.startsWith('/admin');
        const isGroupPath = location.pathname.startsWith('/groups');

        // Admin panel navigation
        if (role === 'admin' && isAdminPath) {
            return [
                { name: 'Dashboard', path: '/admin/dashboard', icon: MdDashboard },
                { name: 'Users', path: '/admin/users', icon: MdGroup },
                { name: 'Categories', path: '/admin/categories', icon: MdPieChart },
                { name: 'Reports', path: '/admin/reports', icon: MdAnalytics },
                { name: 'Profile', path: '/admin/profile', icon: MdAdminPanelSettings },
                { name: 'Personal Mode', path: '/dashboard', icon: MdHome, action: () => setAppMode('personal') },
            ];
        }

        // Group navigation
        if (isGroupPath || appMode === 'group') {
            const items = [
                { name: 'Dashboard', path: '/groups/dashboard', icon: MdDashboard },
                { name: 'Expenses', path: '/groups/expenses', icon: MdAttachMoney },
                { name: 'Settlements', path: '/groups/settlement', icon: MdHandshake },
                { name: 'Members', path: '/groups/members', icon: MdGroup },
                { name: 'Analysis', path: '/groups/analytics', icon: MdAnalytics },
                { name: 'Reports', path: '/groups/reports', icon: MdPieChart },
                { name: 'Personal Mode', path: '/dashboard', icon: MdHome, action: () => setAppMode('personal') },
            ];

            if (role === 'admin') {
                items.push({ name: 'Admin', path: '/admin/dashboard', icon: MdAdminPanelSettings });
            }
            return items;
        }

        // Personal navigation
        const items = [
            { name: 'Dashboard', path: '/dashboard', icon: MdDashboard },
            { name: 'Income', path: '/income', icon: FaMoneyBillWave },
            { name: 'Expenses', path: '/expenses', icon: FaMoneyBillWave },
            { name: 'Reports', path: '/reports', icon: MdPieChart },
            { name: 'Budget', path: '/budget', icon: MdAttachMoney },
            { name: 'Analysis', path: '/analysis', icon: MdAnalytics },
            { name: 'Group Mode', path: '/groups', icon: MdGroup, action: () => setAppMode('group') },
        ];

        if (role === 'admin') {
            items.push({ name: 'Admin', path: '/admin/dashboard', icon: MdAdminPanelSettings, action: () => setAppMode('personal') });
        }
        return items;
    };

    const navItems = getNavItems();

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50
                flex flex-col w-64
                bg-gray-900 text-white
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0
            `}>
                {/* Header */}
                <div className="flex items-center gap-3 h-20 px-6 border-b border-gray-800">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-lg">E</span>
                    </div>
                    <span className="font-bold text-xl">Expentra</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path ||
                                location.pathname.startsWith(item.path + '/');

                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => {
                                        setIsOpen?.(false);
                                        item.action?.();
                                    }}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5
                                        rounded-lg text-sm font-medium
                                        transition-all duration-200
                                        ${isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }
                                    `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;