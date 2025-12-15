import React, { useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useNotifications } from '../context/NotificationContext';

const MessagesPage = () => {
    const { messages, markMessagesRead } = useNotifications();

    useEffect(() => {
        markMessagesRead();
    }, []);

    return (
        <DashboardLayout>
            <div className="messages-container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Messages</h2>

                <div className="message-list" style={{ background: 'var(--bg-card)', backdropFilter: 'blur(10px)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    {messages.length > 0 ? (
                        messages.map(msg => (
                            <div key={msg.id} style={{
                                padding: '1.5rem',
                                borderBottom: '1px solid var(--border-color)',
                                display: 'flex',
                                gap: '1rem',
                                alignItems: 'flex-start'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: '#eff6ff',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    📢
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <h5 style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{msg.sender}</h5>
                                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{msg.time}</span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{msg.text}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</div>
                            <p>No messages yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MessagesPage;
