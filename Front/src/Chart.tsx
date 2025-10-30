import React, { useEffect, useRef, useState } from 'react';

interface ChartProps {
  currentPrice: number;
  resetSignal?: number;
}

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  invisible?: boolean;
}

const CANDLE_INTERVAL_MS = 500;
const MAX_CANDLES = 30;
const GRID_LINES = 5;
const CHART_PADDING = 0.1;

const Chart: React.FC<ChartProps> = ({ currentPrice, resetSignal }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const lastCandleTime = useRef<number>(0);
  const currentCandle = useRef<Candle | null>(null);

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

  useEffect(() => {
    if (resetSignal) {
      const paddingCandles: Candle[] = [];
      for (let i = 0; i < MAX_CANDLES - 1; i++) {
        paddingCandles.push({
          open: 0,
          high: 0,
          low: 0,
          close: 0,
          invisible: true,
        });
      }
      setCandles(paddingCandles);
      currentCandle.current = null;
      lastCandleTime.current = 0;
    }
  }, [resetSignal]);

  useEffect(() => {
    if (currentPrice <= 0) return;

    const now = Date.now();
    if (now - lastCandleTime.current >= CANDLE_INTERVAL_MS) {
      if (currentCandle.current) {
        setCandles(prev => [...prev.slice(-MAX_CANDLES + 1), currentCandle.current!]);
      }
      currentCandle.current = {
        open: currentPrice,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice,
      };
      lastCandleTime.current = now;
    } else if (currentCandle.current) {
      currentCandle.current.high = Math.max(currentCandle.current.high, currentPrice);
      currentCandle.current.low = Math.min(currentCandle.current.low, currentPrice);
      currentCandle.current.close = currentPrice;
    } else {
      currentCandle.current = {
        open: currentPrice,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice,
      };
      lastCandleTime.current = now;
    }
  }, [currentPrice]);

  useEffect(() => {
    if (!canvasRef.current || candles.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const allCandles = currentCandle.current
      ? [...candles, currentCandle.current]
      : candles;

    const visibleCandles = allCandles.filter(c => !c.invisible);
    if (visibleCandles.length === 0) return;

    const prices = visibleCandles.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * CHART_PADDING;

    const priceToY = (price: number) => {
      return canvas.height - ((price - minPrice + padding) / (priceRange + padding * 2)) * canvas.height;
    };

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 12px Courier New';
    ctx.textAlign = 'right';

    for (let i = 0; i <= GRID_LINES; i++) {
      const y = (canvas.height / GRID_LINES) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();

      const price = maxPrice + padding - (priceRange + padding * 2) * (i / GRID_LINES);
      ctx.fillText(`$${price.toFixed(2)}`, canvas.width - 5, y - 3);
    }

    const candleWidth = Math.max(2, Math.floor((canvas.width - 40) / allCandles.length) - 2);
    const spacing = Math.floor((canvas.width - 40) / allCandles.length);

    allCandles.forEach((candle, index) => {
      if (candle.invisible) return;

      const x = 20 + index * spacing + spacing / 2;
      const openY = priceToY(candle.open);
      const closeY = priceToY(candle.close);
      const highY = priceToY(candle.high);
      const lowY = priceToY(candle.low);
      const isBullish = candle.close >= candle.open;

      // Vibrant red for bullish, blue for bearish
      ctx.strokeStyle = isBullish ? '#ff0033' : '#0066ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 1;
      if (!isFinite(bodyTop) || !isFinite(bodyHeight) || !isFinite(x) || !isFinite(candleWidth)) return;

      if (isBullish) {
        // Red halftone
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        ctx.fillStyle = '#ff6666';
      } else {
        // Blue halftone
        ctx.fillStyle = '#0033ff';
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
        ctx.fillStyle = '#66aaff';
      }

      const dotSpacing = 3;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      ctx.clip();

      for (let dy = 0; dy < bodyHeight; dy += dotSpacing) {
        for (let dx = 0; dx < candleWidth; dx += dotSpacing) {
          const progress = dy / bodyHeight;
          const dotSize = 0.5 + progress * 2;
          ctx.beginPath();
          ctx.arc(
            x - candleWidth / 2 + dx + ((Math.floor(dy / dotSpacing) % 2) * (dotSpacing / 2)),
            bodyTop + dy,
            dotSize,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
      ctx.restore();
    });

    if (currentPrice > 0) {
      const priceY = priceToY(currentPrice);
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff00ff';
      ctx.beginPath();
      ctx.moveTo(0, priceY);
      ctx.lineTo(canvas.width - 60, priceY);
      ctx.stroke();
      ctx.shadowBlur = 0;
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
    backgroundColor: '#0a0e27',
    borderRadius: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'inset 0 0 40px rgba(0, 20, 40, 0.8), inset 0 -30px 50px rgba(0, 0, 0, 0.5)',
    backgroundImage: `
      radial-gradient(ellipse at top left, rgba(138, 43, 226, 0.05) 0%, transparent 50%),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 40px,
        rgba(0,255,255,0.03) 40px,
        rgba(0,255,255,0.03) 41px
      ),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 40px,
        rgba(0,255,255,0.03) 40px,
        rgba(0,255,255,0.03) 41px
      )
    `,
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
};

export default Chart;
