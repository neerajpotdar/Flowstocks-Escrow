import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { notifications, markNotificationsRead } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleBellClick = () => {
        console.log('Bell clicked');
        if (!showNotifications && unreadCount > 0) {
            markNotificationsRead();
        }
        setShowNotifications(!showNotifications);
    };

    const handleMessageClick = () => {
        console.log('Message clicked');
        navigate('/messages');
    };

    // Placeholder for theme toggle logic (CSS variables switch)
    const handleThemeToggle = () => {
        console.log('Theme toggle clicked');
        // For now, just toggling a class on body or just a visual effect
        document.body.classList.toggle('dark-theme');
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-content">
                <header className="top-header">
                    <div className="header-actions">
                        {/* Notification Bell */}
                        <div className="action-btn-wrapper" style={{ position: 'relative' }}>
                            <button
                                className="icon-btn notification-btn"
                                onClick={handleBellClick}
                                title="Notifications"
                            >
                                🔔
                                {unreadCount > 0 && <span className="dot"></span>}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="notification-dropdown">
                                    <div className="dropdown-header">
                                        Notifications
                                    </div>
                                    <div className="dropdown-list">
                                        {notifications.length > 0 ? (
                                            notifications.map(n => (
                                                <div key={n.id} className="dropdown-item">
                                                    <p className="notif-title">{n.title}</p>
                                                    <span className="notif-time">{n.time}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="empty-notif">No notifications</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Messages Button */}
                        <button
                            className="icon-btn chat-btn"
                            onClick={handleMessageClick}
                            title="Messages"
                        >
                            💬
                        </button>

                        {/* User Profile */}
                        <div className="user-profile" onClick={logout} title="Click to Logout">
                            <div className="user-details">
                                <span className="user-name">{user?.name || 'User'}</span>
                                <span className="user-role">Investor</span>
                            </div>
                            <div className="user-avatar">
                                {user?.name ? user.name[0].toUpperCase() : 'U'}
                            </div>
                            <span className="dropdown-arrow">▼</span>
                        </div>
                    </div>
                </header>

                <div className="content-scrollable">
                    {children}
                </div>
            </div>

            {/* Injected Styles for Dropdown (scoped to this component for now) */}
            <style>{`
                .action-btn-wrapper {
                    position: relative;
                }
                .notification-dropdown {
                    position: absolute;
                    top: 120%;
                    right: 0;
                    width: 300px;
                    background: var(--bg-card);
                    backdrop-filter: blur(12px);
                    border: 1px solid var(--border-color);
                    border-radius: 0.5rem;
                    box-shadow: var(--shadow-lg);
                    z-index: 100;
                    overflow: hidden;
                }
                .dropdown-header {
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid var(--border-color);
                    font-weight: 600;
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }
                .dropdown-list {
                    max-height: 300px;
                    overflow-y: auto;
                }
                .dropdown-item {
                    padding: 0.75rem 1rem;
                    border-bottom: 1px solid var(--border-color);
                    transition: background 0.2s;
                }
                .dropdown-item:hover {
                    background: var(--bg-hover);
                }
                .dropdown-item:last-child {
                    border-bottom: none;
                }
                .notif-title {
                    font-size: 0.9rem;
                    margin-bottom: 0.25rem;
                    color: var(--text-primary);
                }
                .notif-time {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                .empty-notif {
                    padding: 1.5rem;
                    text-align: center;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
};

export default DashboardLayout;
