import express from 'express';
import stockService from '../services/stockService.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// In-memory storage for socket-based user subscriptions
// Map<userId, Set<ticker>>
const userSubscriptions = new Map();

// Get all supported stocks (Public)
router.get('/stocks', (req, res) => {
    try {
        const stocks = stockService.getAllStocks();
        res.json({
            success: true,
            data: stocks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stocks',
            error: error.message
        });
    }
});

// Get single stock details (Public)
router.get('/stock/:ticker', (req, res) => {
    try {
        const { ticker } = req.params;
        const stock = stockService.getStock(ticker);

        if (!stock) {
            return res.status(404).json({
                success: false,
                message: 'Stock not found'
            });
        }

        res.json({
            success: true,
            data: stock
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stock details',
            error: error.message
        });
    }
});

// Subscribe to a stock (Protected)
router.post('/subscribe', protect, async (req, res) => {
    try {
        const { ticker } = req.body;
        const userId = req.user._id;

        if (!ticker) {
            return res.status(400).json({
                success: false,
                message: 'Ticker is required'
            });
        }

        if (!stockService.isValidTicker(ticker)) {
            return res.status(400).json({
                success: false,
                message: `Invalid ticker: ${ticker}. Supported tickers: GOOG, TSLA, AMZN, META, NVDA`
            });
        }

        // Update user's subscriptions in MongoDB
        const user = await User.findById(userId);

        if (!user.subscriptions.includes(ticker)) {
            user.subscriptions.push(ticker);
            await user.save();
        }

        // Also update in-memory map for WebSocket updates
        if (!userSubscriptions.has(userId.toString())) {
            userSubscriptions.set(userId.toString(), new Set());
        }
        userSubscriptions.get(userId.toString()).add(ticker);

        res.json({
            success: true,
            message: `Successfully subscribed to ${ticker}`,
            data: stockService.getStock(ticker)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe',
            error: error.message
        });
    }
});

// Unsubscribe from a stock (Protected)
router.post('/unsubscribe', protect, async (req, res) => {
    try {
        const { ticker } = req.body;
        const userId = req.user._id;

        if (!ticker) {
            return res.status(400).json({
                success: false,
                message: 'Ticker is required'
            });
        }

        // Update user's subscriptions in MongoDB
        const user = await User.findById(userId);

        // Ensure subscriptions is an array
        if (!user.subscriptions) {
            user.subscriptions = [];
        }

        user.subscriptions = user.subscriptions.filter(t => t !== ticker);
        await user.save();

        // Also update in-memory map
        if (userSubscriptions.has(userId.toString())) {
            userSubscriptions.get(userId.toString()).delete(ticker);

            if (userSubscriptions.get(userId.toString()).size === 0) {
                userSubscriptions.delete(userId.toString());
            }
        }

        res.json({
            success: true,
            message: `Successfully unsubscribed from ${ticker}`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to unsubscribe',
            error: error.message
        });
    }
});

// Get user's subscribed stocks (Protected)
router.get('/subscriptions', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        const subscribedStocks = user.subscriptions.map(ticker =>
            stockService.getStock(ticker)
        );

        // Sync in-memory map with database
        if (user.subscriptions.length > 0) {
            userSubscriptions.set(userId.toString(), new Set(user.subscriptions));
        }

        res.json({
            success: true,
            data: subscribedStocks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscriptions',
            error: error.message
        });
    }
});

export default router;
export { userSubscriptions };
