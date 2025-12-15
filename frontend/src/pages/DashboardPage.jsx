import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import DashboardLayout from '../components/DashboardLayout';
import StockStatsCard from '../components/StockStatsCard';
import LineChart from '../components/LineChart';
import { API_URL, SOCKET_URL } from '../config';

// URL constants imported from config

function DashboardPage() {
    const { user, token } = useAuth();
    const { addNotification, addMessage } = useNotifications();
    const navigate = useNavigate();
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [allStocks, setAllStocks] = useState([]);
    const [subscribedStocks, setSubscribedStocks] = useState([]);
    const [subscribedTickers, setSubscribedTickers] = useState([]);
    // Default chart ticker (first subscribed or GOOG)
    const [activeChartTicker, setActiveChartTicker] = useState('GOOG');

    // Initialize WebSocket connection
    useEffect(() => {
        const newSocket = io(SOCKET_URL);

        newSocket.on('connect', () => {
            console.log('Connected to WebSocket server');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            setConnected(false);
        });

        // Listen for price updates for subscribed stocks
        newSocket.on('price_update', (updatedStock) => {
            setSubscribedStocks(prevStocks =>
                prevStocks.map(stock =>
                    stock.ticker === updatedStock.ticker ? updatedStock : stock
                )
            );

            // Also update the 'allStocks' list prices to keep the list sync
            setAllStocks(prevStocks =>
                prevStocks.map(stock =>
                    stock.ticker === updatedStock.ticker ? { ...stock, ...updatedStock } : stock
                )
            );

            // Track last update time
            lastUpdateRef.current = Date.now();
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    // Fallback Simulation: If no socket update for 2 seconds, auto-update locally
    const lastUpdateRef = React.useRef(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            if (Date.now() - lastUpdateRef.current > 2000 && allStocks.length > 0) {
                // Simulate updates
                const simulatedUpdates = allStocks.map(stock => {
                    const changePercent = (Math.random() - 0.5) * 2; // +/- 1%
                    const change = (stock.price * changePercent) / 100;
                    let newPrice = stock.price + change;
                    newPrice = Math.max(newPrice, 0.01);

                    return {
                        ...stock,
                        price: newPrice,
                        previousPrice: stock.price,
                        change: newPrice - stock.price,
                        changePercent: ((newPrice - stock.price) / stock.price) * 100
                    };
                });

                // Update state
                setAllStocks(simulatedUpdates);
                setSubscribedStocks(prev =>
                    prev.map(s => simulatedUpdates.find(u => u.ticker === s.ticker) || s)
                );
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [allStocks]);

    // Fetch initial data
    useEffect(() => {
        if (user) {
            fetchStocks();
            fetchSubscriptions();
        }
    }, [user]);

    // Update active chart ticker when subscriptions change if needed
    useEffect(() => {
        if (subscribedTickers.length > 0 && !subscribedTickers.includes(activeChartTicker)) {
            setActiveChartTicker(subscribedTickers[0]);
        }
    }, [subscribedTickers]);

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
                setSubscribedStocks(response.data.data);
                const tickers = response.data.data.map(s => s.ticker);
                setSubscribedTickers(tickers);
                if (tickers.length > 0) setActiveChartTicker(tickers[0]);

                // Subscribe to all initially loaded tickers
                if (socket) {
                    tickers.forEach(ticker => socket.emit('subscribe', ticker));
                }
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        }
    };

    // Re-subscribe when socket connects
    useEffect(() => {
        if (socket && connected && subscribedTickers.length > 0) {
            subscribedTickers.forEach(ticker => {
                socket.emit('subscribe', ticker);
            });
        }
    }, [socket, connected]);

    const handleSubscribe = async (ticker) => {
        try {
            const response = await axios.post(`${API_URL}/subscribe`, { ticker }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                const stock = allStocks.find(s => s.ticker === ticker);
                if (stock) {
                    setSubscribedStocks(prev => [...prev, stock]);
                    setSubscribedTickers(prev => [...prev, ticker]);
                    if (socket) socket.emit('subscribe', ticker);

                    // Notifications
                    addNotification(`Subscribed to ${ticker}`);
                    addMessage(`You have successfully purchased ${ticker} stock.`);
                }
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
                setSubscribedStocks(prev => prev.filter(s => s.ticker !== ticker));
                setSubscribedTickers(prev => prev.filter(t => t !== ticker));
                if (socket) socket.emit('unsubscribe', ticker);
                addNotification(`Unsubscribed from ${ticker}`);
                addMessage(`You have successfully unsubscribed from ${ticker} stock.`);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to unsubscribe');
        }
    };

    return (
        <DashboardLayout>
            {/* Top Row: Stats Cards */}
            <div className="stats-grid">
                {subscribedStocks.length > 0 ? (
                    subscribedStocks.map(stock => (
                        <StockStatsCard
                            key={stock.ticker}
                            stock={stock}
                            onClick={() => navigate(`/stock/${stock.ticker}`)}
                        />
                    ))
                ) : (
                    <div className="stats-card" style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <p style={{ color: 'var(--text-muted)' }}>No Active Subscriptions</p>
                    </div>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-main-grid">
                {/* Left: Chart Area */}
                <div className="chart-container">
                    <div className="section-header">
                        <div>
                            <h3>Price Trends</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Live updates for <span style={{ fontWeight: 'bold' }}>{activeChartTicker}</span>
                            </p>
                        </div>
                    </div>
                    {/* Reusing LineChart Component */}
                    {(() => {
                        const activeStock = subscribedStocks.find(s => s.ticker === activeChartTicker) ||
                            allStocks.find(s => s.ticker === activeChartTicker);
                        return (
                            <LineChart
                                ticker={activeChartTicker}
                                currentPrice={activeStock?.price}
                            />
                        );
                    })()}
                </div>

                {/* Right: My Stocks List */}
                <div className="my-stocks-container">
                    <div className="section-header">
                        <h3>My Stocks</h3>
                        <button className="icon-btn" title="Sort" style={{ width: '28px', height: '28px' }}>⇅</button>
                    </div>

                    <div className="my-stocks-list">
                        {subscribedStocks.length > 0 ? (
                            subscribedStocks.map(stock => {
                                const isSub = subscribedTickers.includes(stock.ticker);
                                const priceChange = stock.price - stock.previousPrice;
                                const isPositive = priceChange >= 0;

                                return (
                                    <div key={stock.ticker} className="stock-list-item">
                                        <div className="list-item-left">
                                            <div className="list-icon">
                                                {stock.ticker[0]}
                                            </div>
                                            <div className="list-info">
                                                <h5
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => setActiveChartTicker(stock.ticker)}
                                                >
                                                    {stock.name}
                                                </h5>
                                                <span className="list-subtext">{stock.ticker}</span>
                                            </div>
                                        </div>

                                        <div className="list-item-right">
                                            <span className="list-price">${stock.price.toFixed(2)}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <span className={`list-change ${isPositive ? 'positive' : 'negative'}`} style={{ color: isPositive ? '#10B981' : '#EF4444' }}>
                                                    {isPositive ? '+' : ''}{priceChange.toFixed(2)}
                                                </span>

                                                {/* Subscribe Toggle */}
                                                <button
                                                    onClick={() => isSub ? handleUnsubscribe(stock.ticker) : handleSubscribe(stock.ticker)}
                                                    style={{
                                                        border: 'none',
                                                        background: 'transparent',
                                                        color: isSub ? '#10B981' : '#cbd5e1',
                                                        cursor: 'pointer',
                                                        fontSize: '1.2rem',
                                                        padding: '0 0.25rem'
                                                    }}
                                                    title={isSub ? 'Unsubscribe' : 'Subscribe'}
                                                >
                                                    {isSub ? '★' : '☆'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                                No stocks subscribed. Use the search or selector to add stocks.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default DashboardPage;
