import React, { createContext, useState, useContext, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [messages, setMessages] = useState([]);
    const [toast, setToast] = useState(null); // { message, type }

    // Load from local storage on mount
    useEffect(() => {
        try {
            const savedNotifs = localStorage.getItem('notifications');
            const savedMsgs = localStorage.getItem('messages');
            if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
            if (savedMsgs) setMessages(JSON.parse(savedMsgs));
        } catch (error) {
            console.error('Failed to parse notifications/messages from local storage', error);
            // Optional: clear corrupted storage
            localStorage.removeItem('notifications');
            localStorage.removeItem('messages');
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem('messages', JSON.stringify(messages));
    }, [messages]);

    const addNotification = (title) => {
        const newNotif = {
            id: Date.now(),
            title,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
        showToast(title, 'success');
    };

    const addMessage = (text) => {
        const newMsg = {
            id: Date.now(),
            sender: 'System',
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false
        };
        setMessages(prev => [newMsg, ...prev]);
        showToast(text, 'info'); // Show visible toast for messages too
    };

    const markNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const markMessagesRead = () => {
        setMessages(prev => prev.map(m => ({ ...m, read: true })));
    };

    // Toast Logic
    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            messages,
            addNotification,
            addMessage,
            markNotificationsRead,
            markMessagesRead
        }}>
            {children}
            {/* Simple Toast Component */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: toast.type === 'success' ? '#10B981' : '#3B82F6',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 9999,
                    animation: 'slideIn 0.3s ease-out',
                    fontWeight: '500'
                }}>
                    {toast.message}
                </div>
            )}
            <style>{`
                @keyframes slideIn {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </NotificationContext.Provider>
    );
};
