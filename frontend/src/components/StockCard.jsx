import React from 'react';
import { useNavigate } from 'react-router-dom';
import LineChart from './LineChart';

const StockCard = ({ stock, onUnsubscribe }) => {
    const navigate = useNavigate();

    const priceChange = stock.price - stock.previousPrice;
    const isPositive = priceChange >= 0;

    const handleCardClick = () => {
        navigate(`/stock/${stock.ticker}`);
    };

    const handleRemove = (e) => {
        e.stopPropagation(); // Prevent card click when removing
        onUnsubscribe(stock.ticker);
    };

    const STOCK_INFO_LOCAL = {
        GOOG: { name: 'Google', color: '#EA4335' },
        TSLA: { name: 'Tesla', color: '#E31937' },
        AMZN: { name: 'Amazon', color: '#FF9900' },
        META: { name: 'Meta', color: '#0668E1' },
        NVDA: { name: 'NVIDIA', color: '#76B900' }
    };

    const info = STOCK_INFO_LOCAL[stock.ticker] || {};

    return (
        <div
            className="stock-card"
            onClick={handleCardClick}
            style={{ cursor: 'pointer' }}
        >
            <div className="card-header">
                <div className="stock-branding">
                    <div className="stock-logo" style={{
                        background: info.color || '#3b82f6',
                        width: '48px',
                        height: '48px',
                        fontSize: '1.25rem'
                    }}>
                        {info.name ? info.name[0] : stock.ticker[0]}
                    </div>
                    <div className="stock-texts">
                        <h3>{info.name || stock.name}</h3>
                        <p className="ticker-badge">{stock.ticker}</p>
                    </div>
                </div>
                <button
                    className="remove-btn"
                    onClick={handleRemove}
                    title="Remove from portfolio"
                >
                    ✕
                </button>
            </div>

            <div className="current-price">
                ${stock.price.toFixed(2)}
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? '▲' : '▼'} ${Math.abs(priceChange).toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </span>
            </div>

            {/* Embedded Chart with Timeframe Controls */}
            <div className="card-chart-container" onClick={(e) => e.stopPropagation()}>
                <LineChart ticker={stock.ticker} currentPrice={stock.price} />
            </div>
        </div>
    );
};

export default StockCard;
