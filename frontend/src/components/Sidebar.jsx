import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { messages } = useNotifications();

    const unreadMessagesCount = messages.filter(m => !m.read).length;

    const menuItems = [
        { label: 'Dashboard', path: '/dashboard', icon: '88' }, // Grid icon representation
        { label: 'Stocks', path: '/stocks', active: false },
        { label: 'Calendar', path: '/calendar' },
        { label: 'Profile', path: '/profile' },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                <div className="brand-logo">📊</div>
                <h1 className="brand-text">Flowstocks</h1>
            </div>

            <div className="sidebar-menu">
                <p className="menu-header">MENU</p>
                <ul>
                    {menuItems.map((item, index) => (
                        <li key={index} className={`menu-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => item.path && navigate(item.path)}>
                            <div className="menu-link">
                                <span className="menu-icon">
                                    {item.label === 'Dashboard' ? '⊞' : '○'}
                                </span>
                                <span className="menu-label">{item.label}</span>
                            </div>
                            {item.badge && <span className="menu-badge">{item.badge}</span>}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="sidebar-footer">
                <p className="menu-header">SUPPORT</p>
                <ul>
                    <li className="menu-item" onClick={() => navigate('/messages')}>
                        <div className="menu-link">
                            <span className="menu-icon">✉</span>
                            <span className="menu-label">Messages</span>
                        </div>
                        {unreadMessagesCount > 0 && <span className="menu-badge badge-blue">{unreadMessagesCount}</span>}
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
