
// TODO: add Tutorial stuff.

import React from 'react';
import type { LeaderboardEntry } from './hooks/useSocket';

interface GameOverlayProps {
  overlayBtn: () => void;
  isGameOver: boolean;
  leaderboard?: LeaderboardEntry[];
}

const GameOverlay: React.FC<GameOverlayProps> = ({ overlayBtn, isGameOver, leaderboard }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        {isGameOver && (
          <>
            <h1 style={styles.gameOverText}>Game Ended</h1>
            {leaderboard && leaderboard.length > 0 && (
              <div style={styles.leaderboardContainer}>
                <h2 style={styles.leaderboardTitle}>Final Rankings</h2>
                <div style={styles.leaderboardList}>
                  {leaderboard.map((entry, index) => (
                    <div key={entry.player_id} style={styles.leaderboardEntry}>
                      <span style={styles.rank}>#{index + 1}</span>
                      <span style={styles.playerName}>
                        {entry.player_id === 'AI' ? 'AI Agent' : entry.player_id}
                      </span>
                      <span style={styles.networth}>
                        ${Math.floor(entry.networth).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        <button onClick={overlayBtn} style={styles.startButton}>
          {isGameOver ? 'Play Again' : 'Start Game'}
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(42, 42, 42, 0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backgroundImage: `
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(245,241,232,0.05) 2px,
        rgba(245,241,232,0.05) 4px
      )
    `,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '30px',
    padding: '40px',
    backgroundColor: '#f5f1e8',
    border: '6px solid #1a1a1a',
    boxShadow: '12px 12px 0 rgba(0, 0, 0, 0.3)',
  },
  gameOverText: {
    color: '#1a1a1a',
    fontSize: '72px',
    fontWeight: 'bold',
    margin: 0,
    fontFamily: "'Georgia', serif",
    textTransform: 'uppercase',
    letterSpacing: '8px',
    borderTop: '4px solid #1a1a1a',
    borderBottom: '4px solid #1a1a1a',
    padding: '20px 0',
  },
  startButton: {
    padding: '20px 60px',
    fontSize: '28px',
    fontWeight: 'bold',
    backgroundColor: '#2a2a2a',
    color: '#f5f1e8',
    border: '4px solid #1a1a1a',
    borderRadius: '0',
    cursor: 'pointer',
    boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.3)',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    fontFamily: "'Georgia', serif",
  },
  leaderboardContainer: {
    width: '100%',
    maxWidth: '500px',
  },
  leaderboardTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: '20px',
    fontFamily: "'Georgia', serif",
    textTransform: 'uppercase',
    letterSpacing: '3px',
    borderBottom: '3px solid #2a2a2a',
    paddingBottom: '10px',
  },
  leaderboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  leaderboardEntry: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px 20px',
    backgroundColor: '#fefcf7',
    border: '3px solid #2a2a2a',
    boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.2)',
  },
  rank: {
    fontSize: '24px',
    fontWeight: 'bold',
    fontFamily: "'Georgia', serif",
    color: '#1a1a1a',
    minWidth: '50px',
  },
  playerName: {
    fontSize: '20px',
    fontWeight: 'bold',
    fontFamily: "'Georgia', serif",
    color: '#1a1a1a',
    flex: 1,
  },
  networth: {
    fontSize: '20px',
    fontWeight: 'bold',
    fontFamily: "'Courier New', monospace",
    color: '#2a2a2a',
  },
};

export default GameOverlay;
