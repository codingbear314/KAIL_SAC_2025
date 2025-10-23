import React from 'react';
import type { LeaderboardEntry, PlayerState } from './hooks/useSocket';

interface ScoreboardProps {
  leaderboard: LeaderboardEntry[];
  players: Record<string, PlayerState>;
  currentPriceA: number;
  currentPriceB: number;
  stockASymbol: string;
  stockBSymbol: string;
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  leaderboard,
  players,
  currentPriceA,
  currentPriceB
}) => {
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.networth - a.networth);

  return (
    <div style={styles.container}>
      <div style={styles.scoreboardList}>
        {sortedLeaderboard.map((entry, index) => {
          const player = players[entry.player_id];
          const isAI = entry.type === 'ai';

          return (
            <div
              key={entry.player_id}
              style={styles.playerCard}
            >
              <div style={styles.playerHeader}>
                <div style={{...styles.rankText, color: '#1a1a1a'}}>
                  #{index + 1}
                </div>
                <div style={styles.playerName}>
                  {isAI ? '🤖 AI Agent' : entry.player_id}
                </div>
              </div>

              {!isAI && player && (
                <div style={styles.chartsGrid}>
                  {/* Chart A */}
                  <div
                    style={{
                      ...styles.chartCell,
                      ...(player.fund_a.shares > 0 ? styles.stockValue : styles.cashValue)
                    }}
                  >
                    {formatCurrency(player.fund_a.value)}
                  </div>
                  <div style={styles.sharesCell}>
                    {player.fund_a.shares > 0 ? `${player.fund_a.shares.toFixed(2)}sh` : '-'}
                  </div>

                  {/* Chart B */}
                  <div
                    style={{
                      ...styles.chartCell,
                      ...(player.fund_b.shares > 0 ? styles.stockValue : styles.cashValue)
                    }}
                  >
                    {formatCurrency(player.fund_b.value)}
                  </div>
                  <div style={styles.sharesCell}>
                    {player.fund_b.shares > 0 ? `${player.fund_b.shares.toFixed(2)}sh` : '-'}
                  </div>
                </div>
              )}

              {isAI && (
                <div style={styles.aiNetworth}>
                  Total: {formatCurrency(entry.networth)}
                </div>
              )}
            </div>
          );
        })}
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
  aiNetworth: {
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: "'Courier New', monospace",
    padding: '8px',
  },
};

export default Scoreboard;
