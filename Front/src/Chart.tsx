import React, { useEffect, useRef, useState } from 'react';

interface ChartProps {
  chartId: number;
  data: any[];
  currentPrice: number;
}

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp: number;
}

const Chart: React.FC<ChartProps> = ({ chartId, data, currentPrice }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const lastCandleTime = useRef<number>(0);
  const currentCandle = useRef<Candle | null>(null);

  // Update dimensions when container resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Build candles from price updates
  useEffect(() => {
    if (currentPrice <= 0) return;

    const now = Date.now();
    const CANDLE_INTERVAL = 500; // 1 second per candle

    // Create new candle every interval
    if (now - lastCandleTime.current >= CANDLE_INTERVAL) {
      if (currentCandle.current) {
        setCandles(prev => [...prev.slice(-99), currentCandle.current!]);
      }
      currentCandle.current = {
        open: currentPrice,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice,
        timestamp: now
      };
      lastCandleTime.current = now;
    } else if (currentCandle.current) {
      // Update current candle
      currentCandle.current.high = Math.max(currentCandle.current.high, currentPrice);
      currentCandle.current.low = Math.min(currentCandle.current.low, currentPrice);
      currentCandle.current.close = currentPrice;
    } else {
      // Initialize first candle
      currentCandle.current = {
        open: currentPrice,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice,
        timestamp: now
      };
      lastCandleTime.current = now;
    }
  }, [currentPrice]);

  // Draw candlestick chart
  useEffect(() => {
    if (!canvasRef.current || candles.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate price range
    const prices = candles.flatMap((c: Candle) => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.1;

    // Helper to convert price to Y coordinate
    const priceToY = (price: number) => {
      return canvas.height - ((price - minPrice + padding) / (priceRange + padding * 2)) * canvas.height;
    };

    // Draw grid lines
    ctx.strokeStyle = 'rgba(42, 42, 42, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = (canvas.height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();

      // Price labels
      const price = maxPrice + padding - (priceRange + padding * 2) * (i / 5);
      ctx.fillStyle = '#4a4a4a';
      ctx.font = '11px Courier New';
      ctx.textAlign = 'right';
      ctx.fillText(`$${price.toFixed(2)}`, canvas.width - 5, y - 3);
    }

    // Calculate candle width
    const candleWidth = Math.max(2, Math.floor((canvas.width - 40) / candles.length) - 2);
    const spacing = Math.floor((canvas.width - 40) / candles.length);

    // Draw candles
    candles.forEach((candle: Candle, index: number) => {
      const x = 20 + index * spacing + spacing / 2;
      const openY = priceToY(candle.open);
      const closeY = priceToY(candle.close);
      const highY = priceToY(candle.high);
      const lowY = priceToY(candle.low);

      const isBullish = candle.close >= candle.open;
      
      // Draw wick
      ctx.strokeStyle = isBullish ? '#2d6a2d' : '#8b0000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 1;
      
      if (isBullish) {
        ctx.strokeStyle = '#2d6a2d';
        ctx.fillStyle = '#fefcf7';
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      } else {
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      }
    });

    // Draw current price line
    if (currentPrice > 0) {
      const priceY = priceToY(currentPrice);
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, priceY);
      ctx.lineTo(canvas.width - 60, priceY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

  }, [candles, currentPrice, dimensions]);

  return (
    <div style={styles.container}>
      <div style={styles.chartArea} ref={containerRef}>
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          style={styles.canvas}
        />
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  chartArea: {
    flex: 1,
    backgroundColor: '#fefcf7',
    border: '3px double #2a2a2a',
    borderRadius: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    position: 'relative',
    overflow: 'hidden',
    backgroundImage: `
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 50px,
        rgba(42,42,42,0.05) 50px,
        rgba(42,42,42,0.05) 51px
      ),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 50px,
        rgba(42,42,42,0.05) 50px,
        rgba(42,42,42,0.05) 51px
      )
    `,
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
};

export default Chart;
