import React, { useEffect, useRef, useState } from 'react';

const LineChart = ({ ticker, currentPrice }) => {
    const canvasRef = useRef(null);
    const [priceHistory, setPriceHistory] = useState([]);
    const [timeframe, setTimeframe] = useState('LIVE');

    const timeframes = [
        { label: 'LIVE', points: 50, interval: 1000 },       // 1 second updates, 50s history
        { label: '1D', points: 60, interval: 1800000 },      // 24h
        { label: '1W', points: 100, interval: 6048000 },     // 1 week
        { label: '1M', points: 100, interval: 25920000 },    // 1 month
        { label: '3M', points: 100, interval: 77760000 },    // 3 months
        { label: '6M', points: 100, interval: 155520000 },   // 6 months
        { label: '1Y', points: 100, interval: 315360000 },   // 1 year
        { label: 'ALL', points: 100, interval: 630720000 }   // 2 years
    ];

    const currentTimeframe = timeframes.find(tf => tf.label === timeframe);

    // Load history from localStorage or Init
    useEffect(() => {
        if (!ticker) return;

        const savedHistory = localStorage.getItem(`chart_history_${ticker}_${timeframe}`);

        if (savedHistory) {
            let parsedHistory = JSON.parse(savedHistory);
            // Optional: check if history is stale? For now just use it.
            setPriceHistory(parsedHistory);
        } else {
            // Generate mock history anchored to currentPrice
            const basePrice = currentPrice || 150;
            const history = [];
            let price = basePrice;

            // Add current point first
            history.push({
                price: basePrice,
                timestamp: Date.now()
            });

            // Generate history going backwards with MORE VOLATILITY for "ups and downs"
            for (let i = 1; i < currentTimeframe.points; i++) {
                // Increased volatility for more dramatic waves
                const volatility = basePrice * 0.025;
                const change = (Math.random() - 0.5) * volatility;
                price = price - change;
                price = Math.max(price, basePrice * 0.2);

                history.unshift({
                    price: price,
                    timestamp: Date.now() - i * currentTimeframe.interval
                });
            }
            setPriceHistory(history);
        }
    }, [ticker, timeframe]);

    // Update with real-time price & Persist
    useEffect(() => {
        if (!currentPrice || priceHistory.length === 0) return;

        setPriceHistory(prev => {
            if (prev.length === 0) return prev;

            const lastPoint = prev[prev.length - 1];
            const timeDiff = Date.now() - lastPoint.timestamp;
            const updateThreshold = currentTimeframe.interval;

            let newHistory = [...prev];

            if (timeDiff >= updateThreshold) {
                newHistory.push({
                    price: currentPrice,
                    timestamp: Date.now()
                });
            } else {
                newHistory[newHistory.length - 1] = {
                    ...lastPoint,
                    price: currentPrice,
                    timestamp: Date.now()
                };
            }

            const sliced = newHistory.slice(-currentTimeframe.points);
            localStorage.setItem(`chart_history_${ticker}_${timeframe}`, JSON.stringify(sliced));
            return sliced;
        });

    }, [currentPrice, ticker, timeframe]);

    const [activePoint, setActivePoint] = useState(null);

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas || priceHistory.length === 0) return;

        const rect = canvas.getBoundingClientRect();
        // Scale mouse coordinates to match canvas resolution (width=1200)
        const scaleX = canvas.width / rect.width;
        const x = (e.clientX - rect.left) * scaleX;

        const padding = { top: 40, right: 60, bottom: 40, left: 10 };
        const width = canvas.width;
        const chartWidth = width - padding.left - padding.right;

        // Find closest index based on X position
        // x = padding.left + (index / (len - 1)) * chartWidth
        // index / (len - 1) = (x - padding.left) / chartWidth
        let index = Math.round(((x - padding.left) / chartWidth) * (priceHistory.length - 1));

        // Clamp index
        index = Math.max(0, Math.min(index, priceHistory.length - 1));

        setActivePoint(index);
    };

    const handleMouseLeave = () => {
        setActivePoint(null);
    };

    // Draw Chart (Smooth Spline/Bezier)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || priceHistory.length === 0) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate scales
        const padding = { top: 40, right: 60, bottom: 40, left: 10 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const prices = priceHistory.map(p => p.price);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const priceRange = maxPrice - minPrice || 1;

        // Trend Color
        const firstPrice = priceHistory[0].price;
        const lastPrice = priceHistory[priceHistory.length - 1].price;
        const isPositive = lastPrice >= firstPrice;

        const strokeColor = isPositive ? '#10B981' : '#EF4444';
        const gradientStart = isPositive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';
        const gradientStop = 'rgba(0, 0, 0, 0)';

        const priceToY = (price) => {
            return padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
        };

        const indexToX = (index) => {
            return padding.left + (index / (priceHistory.length - 1)) * chartWidth;
        };

        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 4; i++) {
            const y = padding.top + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Price labels
            const price = maxPrice - (priceRange / 4) * i;
            ctx.fillStyle = '#94A3B8';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`$${price.toFixed(2)}`, width - padding.right + 10, y + 4);
        }

        // Draw Line Chart
        const points = priceHistory.map((p, i) => ({ x: indexToX(i), y: priceToY(p.price) }));

        if (points.length > 0) {
            // 1. Draw Gradient Fill Area
            const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
            gradient.addColorStop(0, gradientStart);
            gradient.addColorStop(1, gradientStop);

            ctx.beginPath();
            ctx.moveTo(padding.left, height - padding.bottom); // Bottom Left
            ctx.lineTo(points[0].x, points[0].y); // First point

            // Trace Curve
            for (let i = 0; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            if (points.length > 1) {
                ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y); // Last point
            }

            ctx.lineTo(points[points.length - 1].x, height - padding.bottom); // Bottom Right
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();

            // 2. Draw Stroke Line with Glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = strokeColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 3;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 0; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            if (points.length > 1) {
                ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // 3. Draw current price dot (if not hovering or as default)
        const lastP = points[points.length - 1];
        if (lastP) {
            ctx.beginPath();
            ctx.arc(lastP.x, lastP.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // 4. Draw Tooltip (Active Point)
        if (activePoint !== null && points[activePoint]) {
            const p = points[activePoint];
            const data = priceHistory[activePoint];

            // Vertical line
            ctx.beginPath();
            ctx.moveTo(p.x, padding.top);
            ctx.lineTo(p.x, height - padding.bottom);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Point highlight
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#1e293b';
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Tooltip Box
            const tooltipPadding = 8;
            const text = `$${data.price.toFixed(2)}`;
            ctx.font = 'bold 14px Inter, sans-serif';
            const textWidth = ctx.measureText(text).width;

            let boxX = p.x - textWidth / 2 - tooltipPadding;
            let boxY = p.y - 40;

            // Boundary checks
            if (boxX < padding.left) boxX = padding.left;
            if (boxX + textWidth + tooltipPadding * 2 > width - padding.right)
                boxX = width - padding.right - textWidth - tooltipPadding * 2;
            if (boxY < 0) boxY = p.y + 20;

            // Background
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.roundRect(boxX, boxY, textWidth + tooltipPadding * 2, 28, 4);
            ctx.fill();
            ctx.stroke();

            // Text
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(text, boxX + tooltipPadding, boxY + 19);

            // Time label below? Optional
        }

    }, [priceHistory, activePoint]);

    return (
        <div className="line-chart-wrapper" style={{ background: 'transparent', padding: '1rem' }}>
            <div className="chart-timeframe-buttons" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                {timeframes.map(tf => (
                    <button
                        key={tf.label}
                        className={`timeframe-btn ${timeframe === tf.label ? 'active' : ''}`}
                        onClick={() => setTimeframe(tf.label)}
                        style={{
                            background: timeframe === tf.label ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                            color: timeframe === tf.label ? 'white' : 'var(--text-muted)',
                            border: '1px solid',
                            borderColor: timeframe === tf.label ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: timeframe === tf.label ? '0 0 15px rgba(124, 58, 237, 0.4)' : 'none'
                        }}
                    >
                        {tf.label}
                    </button>
                ))}
            </div>
            <div className="line-chart-container">
                <canvas
                    ref={canvasRef}
                    width={1200} // High resolution internal
                    height={350}
                    style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                />
            </div>
        </div>
    );
};

export default LineChart;
