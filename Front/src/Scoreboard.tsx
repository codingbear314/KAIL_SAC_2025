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
    1: '#ff2339ff', 
    2: '#2dff5bff',
    3: '#27a1ffff',
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
              borderColor: player.color,
              backgroundColor: player.color + '33', // Add transparency
            }}
          >
            <div style={styles.playerHeader}>
              <div 
                style={{
                  ...styles.rankBadge,
                  backgroundColor: player.color,
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
    gap: '15px',
  },
  playerCard: {
    border: '3px solid',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  playerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  rankBadge: {
    color: 'white',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    flexShrink: 0,
  },
  playerName: {
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#333',
    flex: 1,
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '6px',
  },
  chartCell: {
    backgroundColor: '#ffffff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cashValue: {
    color: '#000000',
  },
  stockValue: {
    color: '#22c55e',
  },
  sharesCell: {
    backgroundColor: '#ffffff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 'normal',
    textAlign: 'center',
    color: '#666',
  },
};

export default Scoreboard;