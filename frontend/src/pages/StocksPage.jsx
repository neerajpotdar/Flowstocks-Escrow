import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import DashboardLayout from '../components/DashboardLayout';
import StockSelector from '../components/StockSelector';

const API_URL = 'http://localhost:3001/api';

const StocksPage = () => {
    const { user, token } = useAuth();
    const { addNotification, addMessage } = useNotifications();
    const [allStocks, setAllStocks] = useState([]);
    const [subscribedTickers, setSubscribedTickers] = useState([]);

    useEffect(() => {
        if (user) {
            fetchStocks();
            fetchSubscriptions();
        }
    }, [user]);

    const fetchStocks = async () => {
        try {
            const response = await axios.get(`${API_URL}/stocks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setAllStocks(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stocks:', error);
        }
    };

    const fetchSubscriptions = async () => {
        try {
            const response = await axios.get(`${API_URL}/subscriptions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setSubscribedTickers(response.data.data.map(s => s.ticker));
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        }
    };

    const handleSubscribe = async (ticker) => {
        try {
            const response = await axios.post(`${API_URL}/subscribe`, { ticker }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setSubscribedTickers(prev => [...prev, ticker]);
                console.log(`Subscribing to ${ticker} - Triggering Notification and Message`);
                addNotification(`Subscribed to ${ticker}`);
                addMessage(`You have successfully purchased ${ticker} stock.`);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to subscribe');
        }
    };

    const handleUnsubscribe = async (ticker) => {
        try {
            const response = await axios.post(`${API_URL}/unsubscribe`, { ticker }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setSubscribedTickers(prev => prev.filter(t => t !== ticker));
                addNotification(`Unsubscribed from ${ticker}`);
                addMessage(`You have successfully unsubscribed from ${ticker} stock.`);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to unsubscribe');
        }
    };

    return (
        <DashboardLayout>
            <div className="stocks-page-header" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Stock Marketplace</h2>
                <p style={{ color: 'var(--text-muted)' }}>Browse and subscribe to available market stocks</p>
            </div>

            <StockSelector
                availableStocks={allStocks}
                subscribedTickers={subscribedTickers}
                onSubscribe={handleSubscribe}
                onUnsubscribe={handleUnsubscribe}
            />
        </DashboardLayout>
    );
};

export default StocksPage;
