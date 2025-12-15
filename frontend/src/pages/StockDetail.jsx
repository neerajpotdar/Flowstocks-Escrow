import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import LineChart from '../components/LineChart';
import '../stock-detail.css';

const SOCKET_URL = 'http://localhost:3001';
const API_URL = 'http://localhost:3001/api';

// Stock descriptions and company info
const STOCK_INFO = {
    GOOG: {
        name: 'Alphabet Inc.',
        description: 'Alphabet Inc. is a multinational conglomerate and the parent company of Google. It specializes in Internet-related services and products, including search engines, online advertising, cloud computing, software, and hardware.',
        sector: 'Technology',
        founded: '2015',
        headquarters: 'Mountain View, California'
    },
    TSLA: {
        name: 'Tesla, Inc.',
        description: 'Tesla, Inc. is an American electric vehicle and clean energy company. Tesla designs and manufactures electric cars, battery energy storage, solar panels, and related products and services.',
        sector: 'Automotive & Energy',
        founded: '2003',
        headquarters: 'Austin, Texas'
    },
    AMZN: {
        name: 'Amazon.com, Inc.',
        description: 'Amazon.com, Inc. is a multinational technology company focusing on e-commerce, cloud computing, digital streaming, and artificial intelligence. It is one of the Big Five companies in the U.S. information technology industry.',
        sector: 'E-commerce & Technology',
        founded: '1994',
        headquarters: 'Seattle, Washington'
    },
    META: {
        name: 'Meta Platforms, Inc.',
        description: 'Meta Platforms, Inc., formerly Facebook, Inc., is a technology conglomerate. The company owns Facebook, Instagram, WhatsApp, and focuses on building the metaverse and social media platforms.',
        sector: 'Social Media & Technology',
        founded: '2004',
        headquarters: 'Menlo Park, California'
    },
    NVDA: {
        name: 'NVIDIA Corporation',
        description: 'NVIDIA Corporation is a technology company that designs graphics processing units (GPUs) for gaming and professional markets, as well as system on chip units (SoCs) for mobile computing and automotive markets.',
        sector: 'Semiconductors & AI',
        founded: '1993',
        headquarters: 'Santa Clara, California'
    }
};

const StockDetail = () => {
    const { ticker } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stockData, setStockData] = useState(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial Fetch via API (Prevents loading hang)
        fetchStockDetails();

        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            if (user) {
                socket.emit('identify', user.id);
            }
        });

        // Join the specific stock room
        socket.emit('subscribe', ticker);

        // Listen for stock updates
        socket.on('price_update', (updatedStock) => {
            if (updatedStock.ticker === ticker) {
                setStockData(updatedStock);
                setLoading(false);
            }
        });
        // Check if user is subscribed
        checkSubscription();

        return () => {
            socket.close();
        };
    }, [ticker, user]);

    const fetchStockDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/stock/${ticker}`);
            if (response.data.success) {
                setStockData(response.data.data);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching stock details:', error);
            setLoading(false);
        }
    };

    const checkSubscription = async () => {
        try {
            const response = await axios.get(`${API_URL}/subscriptions`);
            if (response.data.success) {
                const subscribed = response.data.data.some(s => s.ticker === ticker);
                setIsSubscribed(subscribed);
            }
        } catch (error) {
            console.error('Error checking subscription:', error);
        }
    };

    const handleSubscribe = async () => {
        try {
            const response = await axios.post(`${API_URL}/subscribe`, { ticker });
            if (response.data.success) {
                setIsSubscribed(true);
            }
        } catch (error) {
            console.error('Error subscribing:', error);
        }
    };

    const handleUnsubscribe = async () => {
        try {
            const response = await axios.post(`${API_URL}/unsubscribe`, { ticker });
            if (response.data.success) {
                setIsSubscribed(false);
                addNotification(`Unsubscribed from ${ticker}`);
                addMessage(`You have successfully unsubscribed from ${ticker} stock.`);
            }
        } catch (error) {
            console.error('Error unsubscribing:', error);
        }
    };

    if (loading || !stockData) {
        return (
            <div className="stock-detail-container">
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading stock data...</p>
                </div>
            </div>
        );
    }

    const info = STOCK_INFO[ticker];
    const priceChange = stockData.price - stockData.previousPrice;
    const priceChangePercent = ((priceChange / stockData.previousPrice) * 100).toFixed(2);
    const isPositive = priceChange >= 0;

    return (
        <div className="stock-detail-container">
            <button
                onClick={() => navigate('/dashboard')}
                className="back-button"
            >
                ← Back to Dashboard
            </button>

            <div className="stock-detail-header">
                <div className="stock-title">
                    <h1>{ticker}</h1>
                    <p className="company-name">{info.name}</p>
                </div>
                <div className="stock-action">
                    {isSubscribed ? (
                        <button
                            onClick={handleUnsubscribe}
                            className="unsubscribe-detail-btn"
                        >
                            ✓ Subscribed
                        </button>
                    ) : (
                        <button
                            onClick={handleSubscribe}
                            className="subscribe-detail-btn"
                        >
                            + Subscribe
                        </button>
                    )}
                </div>
            </div>

            <div className="chart-section">
                <h2>📈 Price Chart</h2>
                <LineChart ticker={ticker} currentPrice={stockData.price} />
            </div>

            <div className="stock-detail-grid">
                <div className="stock-price-card">
                    <div className="current-price">
                        <span className="price-label">Current Price</span>
                        <span className="price-value">${stockData.price.toFixed(2)}</span>
                    </div>
                    <div className={`price-change-detail ${isPositive ? 'positive' : 'negative'}`}>
                        <span className="change-arrow">{isPositive ? '▲' : '▼'}</span>
                        <span className="change-amount">${Math.abs(priceChange).toFixed(2)}</span>
                        <span className="change-percent">({isPositive ? '+' : ''}{priceChangePercent}%)</span>
                    </div>
                </div>

                <div className="stock-info-card">
                    <h2>About {info.name}</h2>
                    <p className="stock-description">{info.description}</p>

                    <div className="stock-meta">
                        <div className="meta-item">
                            <span className="meta-label">Sector:</span>
                            <span className="meta-value">{info.sector}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Founded:</span>
                            <span className="meta-value">{info.founded}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Headquarters:</span>
                            <span className="meta-value">{info.headquarters}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="price-update-notice">
                <span className="pulse-dot"></span>
                Prices update every second
            </div>
        </div>
    );
};

export default StockDetail;
