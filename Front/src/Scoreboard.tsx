import React from 'react';
import type { LeaderboardEntry, PlayerState } from './hooks/useSocket';

interface ScoreboardProps {
  leaderboard: LeaderboardEntry[];
  players: Record<string, PlayerState>;
  currentPriceA: number;
  currentPriceB: number;
}

const DISPLAY_ORDER = ['AI', 'Player 1', 'Player 2'];

const Scoreboard: React.FC<ScoreboardProps> = ({
  players,
  currentPriceA,
  currentPriceB
}) => {
  const formatCurrency = (value: number) => `$${Math.floor(value).toLocaleString()}`;
  
  // Calculate networth for all players
  const networthMap: Record<string, number> = {};
  DISPLAY_ORDER.forEach(playerId => {
    const player = players[playerId];
    if (player) {
      const fundAValue = player.fund_a.shares > 0 
        ? player.fund_a.shares * currentPriceA 
        : player.fund_a.value;
      const fundBValue = player.fund_b.shares > 0 
        ? player.fund_b.shares * currentPriceB 
        : player.fund_b.value;
      networthMap[playerId] = fundAValue + fundBValue;
    }
  });

  // Create rank map based on networth
  const rankMap = Object.fromEntries(
    Object.entries(networthMap)
      .sort((a, b) => b[1] - a[1])
      .map(([id], index) => [id, index + 1])
  );

  return (
    <div style={styles.container}>
      <div style={styles.scoreboardList}>
        {DISPLAY_ORDER.map((playerId) => {
          const player = players[playerId];
          if (!player) return null;

          const fundAValue = player.fund_a.shares > 0 
            ? player.fund_a.shares * currentPriceA 
            : player.fund_a.value;
          const fundBValue = player.fund_b.shares > 0 
            ? player.fund_b.shares * currentPriceB 
            : player.fund_b.value;

          const displayName = playerId === 'AI' ? 'AI Agent' : playerId;

          return (
            <div key={playerId} style={styles.playerCard}>
              <div style={styles.playerHeader}>
                <div style={styles.rankText}>#{rankMap[playerId]}</div>
                <div style={styles.playerName}>{displayName}</div>
              </div>

              <div style={styles.fundsGrid}>
                {/* Fund A */}
                <div style={{
                  ...styles.fundValue,
                  ...(player.fund_a.shares > 0 ? styles.inStock : styles.inCash)
                }}>
                  {formatCurrency(fundAValue)}
                </div>
                <div style={styles.shares}>
                  {player.fund_a.shares > 0 ? `${player.fund_a.shares.toFixed(2)}sh` : '-'}
                </div>

                {/* Fund B */}
                <div style={{
                  ...styles.fundValue,
                  ...(player.fund_b.shares > 0 ? styles.inStock : styles.inCash)
                }}>
                  {formatCurrency(fundBValue)}
                </div>
                <div style={styles.shares}>
                  {player.fund_b.shares > 0 ? `${player.fund_b.shares.toFixed(2)}sh` : '-'}
                </div>
              </div>
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
    border: '3px solid #2a2a2a',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#fefcf7',
    boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.15)',
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
    fontFamily: "'Georgia', serif",
    color: '#1a1a1a',
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
  fundsGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '5px',
  },
  fundValue: {
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: "'Courier New', monospace",
    color: '#1a1a1a',
  },
  inCash: {},
  inStock: {
    textDecoration: 'underline',
    textDecorationStyle: 'double',
  },
  shares: {
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    textAlign: 'center',
    color: '#4a4a4a',
    fontFamily: "'Courier New', monospace",
    fontStyle: 'italic',
  },
};

export default Scoreboard;
