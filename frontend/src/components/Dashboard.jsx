import React from 'react';
import StockCard from './StockCard';

const Dashboard = ({ subscribedStocks, onUnsubscribe }) => {
    if (subscribedStocks.length === 0) {
        return (
            <div className="dashboard">
                <h2>My Portfolio</h2>
                <div className="empty-state">
                    <p>📊 No stocks subscribed yet</p>
                    <small>Select stocks from above to start tracking</small>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <h2>My Portfolio ({subscribedStocks.length})</h2>
            <div className="stats-grid">
                {subscribedStocks.map(stock => (
                    <StockCard
                        key={stock.ticker}
                        stock={stock}
                        onUnsubscribe={onUnsubscribe}
                    />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
