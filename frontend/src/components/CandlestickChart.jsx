import React, { useEffect, useRef, useState } from 'react';

const CandlestickChart = ({ ticker, currentPrice }) => {
    const canvasRef = useRef(null);
    const [candleData, setCandleData] = useState([]);
    const [currentCandle, setCurrentCandle] = useState(null);

    // Initialize with dummy historical data
    useEffect(() => {
        const initialData = [];
        let basePrice = currentPrice || 100;

        for (let i = 0; i < 29; i++) {
            const open = basePrice + (Math.random() - 0.5) * 5;
            const close = open + (Math.random() - 0.5) * 8;
            const high = Math.max(open, close) + Math.random() * 3;
            const low = Math.min(open, close) - Math.random() * 3;

            initialData.push({
                open,
                high,
                low,
                close,
                isGreen: close > open,
                timestamp: Date.now() - (29 - i) * 5000
            });

            basePrice = close;
        }

        setCandleData(initialData);

        // Initialize current candle
        setCurrentCandle({
            open: basePrice,
            high: basePrice,
            low: basePrice,
            close: basePrice,
            isGreen: true,
            timestamp: Date.now()
        });
    }, []);

    // Update current candle with real-time price
    useEffect(() => {
        if (!currentPrice || !currentCandle) return;

        setCurrentCandle(prev => {
            const newHigh = Math.max(prev.high, currentPrice);
            const newLow = Math.min(prev.low, currentPrice);

            return {
                ...prev,
                close: currentPrice,
                high: newHigh,
                low: newLow,
                isGreen: currentPrice > prev.open
            };
        });
    }, [currentPrice]);

    // Create new candle every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (!currentCandle) return;

            // Add current candle to history
            setCandleData(prev => {
                const newData = [...prev, currentCandle];
                // Keep only last 30 candles
                return newData.slice(-29);
            });

            // Start new candle
            setCurrentCandle({
                open: currentCandle.close,
                high: currentCandle.close,
                low: currentCandle.close,
                close: currentCandle.close,
                isGreen: true,
                timestamp: Date.now()
            });
        }, 5000); // New candle every 5 seconds

        return () => clearInterval(interval);
    }, [currentCandle]);

    // Draw chart
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || candleData.length === 0) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas (Transparent for Glassmorphism)
        ctx.clearRect(0, 0, width, height);
        // Removed ctx.fillStyle = '#131722'; and fillRect

        // Combine historical data with current candle
        const allCandles = currentCandle ? [...candleData, currentCandle] : candleData;

        // Calculate scales
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        const candleWidth = chartWidth / allCandles.length;

        const allPrices = allCandles.flatMap(d => [d.high, d.low]);
        const maxPrice = Math.max(...allPrices);
        const minPrice = Math.min(...allPrices);
        const priceRange = maxPrice - minPrice;

        const priceToY = (price) => {
            return padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
        };

        // Draw grid lines (Subtle Dark Mode)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();

            // Price labels (Light Gray)
            const price = maxPrice - (priceRange / 5) * i;
            ctx.fillStyle = '#94A3B8';
            ctx.font = '11px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(`$${price.toFixed(2)}`, padding - 10, y + 4);
        }

        // Draw candlesticks
        allCandles.forEach((candle, index) => {
            const x = padding + index * candleWidth + candleWidth / 2;
            const openY = priceToY(candle.open);
            const closeY = priceToY(candle.close);
            const highY = priceToY(candle.high);
            const lowY = priceToY(candle.low);

            const isCurrentCandle = index === allCandles.length - 1 && currentCandle;
            const color = candle.isGreen ? '#00e676' : '#ff5252';
            const bodyWidth = candleWidth * 0.6;

            // Add glow effect for current candle
            if (isCurrentCandle) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = color;
            }

            // Draw wick (high-low line)
            ctx.strokeStyle = color;
            ctx.lineWidth = isCurrentCandle ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(x, highY);
            ctx.lineTo(x, lowY);
            ctx.stroke();

            // Draw body (open-close rectangle)
            ctx.fillStyle = color;
            const bodyHeight = Math.abs(closeY - openY);
            const bodyY = Math.min(openY, closeY);

            if (bodyHeight < 2) {
                // Doji candle (open = close)
                ctx.fillRect(x - bodyWidth / 2, bodyY - 1, bodyWidth, 2);
            } else {
                ctx.fillRect(x - bodyWidth / 2, bodyY, bodyWidth, bodyHeight);
            }

            // Reset shadow
            ctx.shadowBlur = 0;
        });

        // Draw title
        ctx.fillStyle = '#d1d4dc';
        ctx.font = 'bold 13px Inter';
        ctx.textAlign = 'left';
        ctx.fillText(`${ticker}`, padding, 22);

        // Draw "LIVE" indicator
        ctx.fillStyle = '#00e676';
        ctx.beginPath();
        ctx.arc(width - padding - 30, 18, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00e676';
        ctx.font = '600 11px Inter';
        ctx.textAlign = 'right';
        ctx.fillText('LIVE', width - padding, 22);

    }, [candleData, currentCandle, ticker]);

    return (
        <div className="candlestick-chart-container">
            <canvas
                ref={canvasRef}
                width={1200}
                height={300}
                style={{ width: '100%', height: 'auto', display: 'block' }}
            />
        </div>
    );
};

export default CandlestickChart;
