import React from 'react';

const STOCK_INFO = {
    GOOG: { name: 'Google', description: 'Alphabet Inc.', color: '#EA4335' },
    TSLA: { name: 'Tesla', description: 'Tesla, Inc.', color: '#E31937' },
    AMZN: { name: 'Amazon', description: 'Amazon.com, Inc.', color: '#FF9900' },
    META: { name: 'Meta', description: 'Meta Platforms, Inc.', color: '#0668E1' },
    NVDA: { name: 'NVIDIA', description: 'NVIDIA Corporation', color: '#76B900' }
};

const StockSelector = ({ availableStocks, subscribedTickers, onSubscribe, onUnsubscribe }) => {
    const handleToggle = (ticker) => {
        if (subscribedTickers.includes(ticker)) {
            onUnsubscribe(ticker);
        } else {
            onSubscribe(ticker);
        }
    };

    const scrollContainerRef = React.useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="stock-selector">
            <h2>Available Stocks</h2>
            <div className="stock-options" ref={scrollContainerRef}>
                {// ... existing map ...
                    availableStocks.map(stock => {
                        const isSubscribed = subscribedTickers.includes(stock.ticker);
                        const info = STOCK_INFO[stock.ticker];

                        return (
                            <div
                                key={stock.ticker}
                                className={`stock-option ${isSubscribed ? 'subscribed' : ''}`}
                            >
                                <div className="stock-option-content">
                                    <div className="stock-branding">
                                        <div className="stock-logo" style={{ background: info?.color || '#3b82f6' }}>
                                            {info?.name[0] || stock.ticker[0]}
                                        </div>
                                        <div className="stock-texts">
                                            <h3>{info?.name || stock.name}</h3>
                                            <p className="ticker-badge">{stock.ticker}</p>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
                                        {info?.description || stock.name}
                                    </p>
                                    <button
                                        className={isSubscribed ? 'unsubscribe-btn' : 'subscribe-btn'}
                                        onClick={() => handleToggle(stock.ticker)}
                                        aria-label={isSubscribed ? `Unsubscribe from ${stock.ticker}` : `Subscribe to ${stock.ticker}`}
                                    >
                                        {isSubscribed ? '✓ Subscribed' : 'Subscribe'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
            </div>
            {/* Toggle/Slide Controls */}
            <div className="slider-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                    onClick={() => scroll('left')}
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        transition: 'all 0.2s'
                    }}
                    className="slider-btn"
                >
                    ←
                </button>
                <button
                    onClick={() => scroll('right')}
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        transition: 'all 0.2s'
                    }}
                    className="slider-btn"
                >
                    →
                </button>
            </div>
        </div>
    );
};

export default StockSelector;
