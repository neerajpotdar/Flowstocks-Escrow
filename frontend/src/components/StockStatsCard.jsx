import React from 'react';
import { useNavigate } from 'react-router-dom';

const StockStatsCard = ({ stock, onClick }) => {
    const isPositive = (stock.price - stock.previousPrice) >= 0;
    const changeAmount = stock.price - stock.previousPrice;
    const changePercent = ((changeAmount / stock.previousPrice) * 100).toFixed(2);

    // Determine colors
    const color = stock.ticker === 'GOOG' ? '#EA4335' :
        stock.ticker === 'TSLA' ? '#E31937' :
            stock.ticker === 'AMZN' ? '#FF9900' :
                stock.ticker === 'META' ? '#0668E1' : '#76B900';

    return (
        <div className="stats-card" onClick={onClick}>
            <div className="card-top">
                <div className="stock-identity">
                    <div className="stock-icon" style={{ backgroundColor: '#f1f5f9' }}>
                        {/* Simple colored letter for icon */}
                        <span style={{ color: color, fontWeight: 'bold', fontSize: '1.2rem' }}>
                            {stock.ticker[0]}
                        </span>
                    </div>
                    <div className="stock-title-section">
                        <h4>{stock.name}</h4>
                    </div>
                </div>

                <div className="mini-chart">
                    {/* Simulated Sparkline SVG */}
                    <svg width="60" height="30" viewBox="0 0 60 30">
                        <path
                            d={isPositive ? "M0,25 Q10,20 20,22 T40,15 T60,5" : "M0,5 Q10,15 20,12 T40,20 T60,25"}
                            fill="none"
                            stroke={isPositive ? "#10B981" : "#EF4444"}
                            strokeWidth="2"
                        />
                    </svg>
                </div>
            </div>

            <div className="card-bottom">
                <div className="stat-item">
                    <span className="stat-label">Total Share</span>
                    <span className="stat-value">${stock.price.toFixed(2)}</span>
                </div>
                <div className="stat-item right">
                    <span className="stat-label">Total Return</span>
                    <span className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
                        {changePercent}% {isPositive ? '▲' : '▼'}
                    </span>
                </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                    }}
                    style={{
                        width: '100%',
                        background: 'rgba(124, 58, 237, 0.15)', // transparent accent
                        border: '1px solid var(--accent-primary)',
                        color: 'var(--accent-primary)',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        padding: '0.4rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'var(--accent-primary)';
                        e.currentTarget.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(124, 58, 237, 0.15)';
                        e.currentTarget.style.color = 'var(--accent-primary)';
                    }}
                >
                    View Details <span>→</span>
                </button>
            </div>
        </div>
    );
};

export default StockStatsCard;
