import React from 'react';

interface ChartPosition {
  cashValue: number;      // Cash amount if holding cash
  stockShares: number;    // Number of shares if holding stock
  isStock: boolean;       // true = stock (green), false = cash (black)
}

interface Player {
  id: number;
  name: string;
  rank: number;
  color: string;
  charts: {
    1: ChartPosition;
    2: ChartPosition;
  };
}

interface ScoreboardProps {
  chartPrices: {
    1: number;
    2: number;
  };
}

const Scoreboard: React.FC<ScoreboardProps> = ({ chartPrices }) => {
  const prices = chartPrices;

  const PLAYER_COLORS = {
    1: '#1a1a1a', 
    2: '#1a1a1a',
    3: '#1a1a1a',
  };

  // either all cash or all stock
  const players: Player[] = [
    {
      id: 1,
      name: 'Player 1',
      rank: 1,
      color: PLAYER_COLORS[1],
      charts: {
        1: { cashValue: 0, stockShares: 80, isStock: true },   // 80 shares
        2: { cashValue: 7000, stockShares: 0, isStock: false }, // Cash
      },
    },
    {
      id: 2,
      name: 'Player 2',
      rank: 2,
      color: PLAYER_COLORS[2],
      charts: {
        1: { cashValue: 6000, stockShares: 0, isStock: false }, // Cash
        2: { cashValue: 0, stockShares: 60, isStock: true },    // 60 shares
      },
    },
    {
      id: 3,
      name: 'Player 3',
      rank: 3,
      color: PLAYER_COLORS[3],
      charts: {
        1: { cashValue: 10000, stockShares: 0, isStock: false }, // Cash
        2: { cashValue: 0, stockShares: 30, isStock: true },     // 30 shares
      },
    },
  ];

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.scoreboardList}>
        {players.map((player) => (
          <div 
            key={player.id} 
            style={{
              ...styles.playerCard,
            }}
          >
            <div style={styles.playerHeader}>
              <div 
                style={{
                  ...styles.rankText,
                  color: player.color,
                }}
              >
                #{player.rank}
              </div>
              <div style={styles.playerName}>{player.name}</div>
            </div>
            
            {/* 2x2 Grid for charts - showing networth and shares */}
            <div style={styles.chartsGrid}>
              {[1, 2].map((chartId) => {
                const position = player.charts[chartId as keyof typeof player.charts];
                const currentPrice = prices[chartId as keyof typeof prices];
                
                // Calculate display value: cash if holding cash, stock value if holding stock
                const displayValue = position.isStock 
                  ? position.stockShares * currentPrice 
                  : position.cashValue;
                
                return (
                  <React.Fragment key={chartId}>
                    {/* Networth */}
                    <div 
                      style={{
                        ...styles.chartCell,
                        ...(position.isStock ? styles.stockValue : styles.cashValue)
                      }}
                    >
                      {formatCurrency(displayValue)}
                    </div>
                    {/* Stock Shares */}
                    <div style={styles.sharesCell}>
                      {position.isStock ? `${position.stockShares}sh` : '-'}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
  },
  scoreboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  playerCard: {
    border: '3px solid',
    borderRadius: '0',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#fefcf7',
    boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.15)',
    position: 'relative',
  },
  playerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '2px solid #2a2a2a',
    paddingBottom: '5px',
  },
  rankText: {
    fontWeight: 'bold',
    fontSize: '20px',
    flexShrink: 0,
    fontFamily: "'Georgia', serif",
  },
  playerName: {
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#1a1a1a',
    flex: 1,
    fontFamily: "'Georgia', serif",
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '5px',
  },
  chartCell: {
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '0',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: "'Courier New', monospace",
  },
  cashValue: {
    color: '#1a1a1a',
  },
  stockValue: {
    color: '#1a1a1a',
    textDecoration: 'underline',
    textDecorationStyle: 'double',
  },
  sharesCell: {
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '0',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 'normal',
    textAlign: 'center',
    color: '#4a4a4a',
    fontFamily: "'Courier New', monospace",
    fontStyle: 'italic',
  },
};

export default Scoreboard;