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
    backgroundColor: '#f5f5f5',
    border: '1px solid #ccc',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
  },
  placeholder: {
    color: '#666',
    fontSize: '16px',
    textAlign: 'center',
  },
  dataInfo: {
    marginTop: '10px',
    fontSize: '14px',
    color: '#888',
  },
};

export default Chart;