import React from 'react';
import type { CandleData } from './hooks/useWebSocket';

interface ChartProps {
  chartId: number;
  data: CandleData[];
  currentPrice: number;
}

const Chart: React.FC<ChartProps> = ({ chartId, data, currentPrice }) => {
  return (
    <div style={styles.container}>
      <div style={styles.chartArea}>
        {/* Candle chart will be implemented here later */}
        <div style={styles.placeholder}>
          <p>Chart {chartId} - Candlestick chart will be displayed here</p>
          <p style={styles.dataInfo}>
            Receiving {data.length} candles
            {currentPrice > 0 && (
              <span>
                <br />
                Latest: ${currentPrice.toFixed(2)}
              </span>
            )}
          </p>
        </div>
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
  placeholder: {
    color: '#4a4a4a',
    fontSize: '16px',
    textAlign: 'center',
    fontFamily: "'Georgia', serif",
    fontStyle: 'italic',
  },
  dataInfo: {
    marginTop: '10px',
    fontSize: '14px',
    color: '#1a1a1a',
    fontFamily: "'Courier New', monospace",
    fontWeight: 'bold',
  },
};

export default Chart;