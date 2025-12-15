import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <DashboardLayout>
            <div className="profile-container" style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
                <div className="profile-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        color: 'white',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)',
                        border: '4px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{user?.name}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Stock Broker Client</p>
                </div>

                <div className="profile-card" style={{
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '2.5rem',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border-color)'
                }}>
                    <div className="profile-item" style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>{user?.name}</div>
                    </div>

                    <div className="profile-item" style={{ marginBottom: '2.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>{user?.email}</div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.background = '#EF4444';
                                e.target.style.color = 'white';
                                e.target.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.background = 'rgba(239, 68, 68, 0.15)';
                                e.target.style.color = '#EF4444';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProfilePage;
