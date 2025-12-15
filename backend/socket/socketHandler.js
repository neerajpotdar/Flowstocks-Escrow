import stockService from '../services/stockService.js';

let priceUpdateInterval = null;

export function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Handle subscription to a ticker
        socket.on('subscribe', (ticker) => {
            if (ticker) {
                socket.join(ticker);
                console.log(`Socket ${socket.id} joined room: ${ticker}`);
            }
        });

        // Handle unsubscription from a ticker
        socket.on('unsubscribe', (ticker) => {
            if (ticker) {
                socket.leave(ticker);
                console.log(`Socket ${socket.id} left room: ${ticker}`);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    // Start broadcasting price updates every 1 second
    if (!priceUpdateInterval) {
        priceUpdateInterval = setInterval(() => {
            try {
                const updatedStocks = stockService.updatePrices();

                // Emit updates to specific ticker rooms
                updatedStocks.forEach(stock => {
                    io.to(stock.ticker).emit('price_update', stock);
                });
                console.log(`[Socket] Emitted updates for ${updatedStocks.length} stocks`);
            } catch (error) {
                console.error('[Socket] Update Loop Error:', error);
            }
        }, 1000);
    }
}

export function stopPriceUpdates() {
    if (priceUpdateInterval) {
        clearInterval(priceUpdateInterval);
        priceUpdateInterval = null;
    }
}
