
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
    backgroundColor: 'rgba(10, 14, 39, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backgroundImage: `
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 20px,
        rgba(255,0,255,0.1) 20px,
        rgba(255,0,255,0.1) 40px
      ),
      repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 20px,
        rgba(0,255,255,0.1) 20px,
        rgba(0,255,255,0.1) 40px
      )
    `,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '30px',
    padding: '50px',
    backgroundColor: 'rgba(10, 14, 39, 0.9)',
    border: '4px solid #ff00ff',
    boxShadow: '0 0 40px rgba(255, 0, 255, 0.6), inset 0 0 40px rgba(255, 0, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  gameOverText: {
    color: '#ff00ff',
    fontSize: '80px',
    fontWeight: '900',
    margin: 0,
    fontFamily: "'Impact', 'Arial Black', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '8px',
    textShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff',
    padding: '20px 0',
  },
  startButton: {
    padding: '20px 60px',
    fontSize: '32px',
    fontWeight: '900',
    backgroundColor: '#0a0e27',
    color: '#00ffff',
    border: '3px solid #00ffff',
    borderRadius: '0',
    cursor: 'pointer',
    boxShadow: '0 0 30px rgba(0, 255, 255, 0.6), inset 0 0 20px rgba(0, 255, 255, 0.1)',
    transition: 'all 0.1s ease',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    fontFamily: "'Impact', 'Arial Black', sans-serif",
    textShadow: '0 0 10px #00ffff',
  },
  leaderboardContainer: {
    width: '100%',
    maxWidth: '600px',
  },
  leaderboardTitle: {
    fontSize: '36px',
    fontWeight: '900',
    color: '#00ffff',
    textAlign: 'center',
    marginBottom: '20px',
    fontFamily: "'Impact', 'Arial Black', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '3px',
    borderBottom: '3px solid #00ffff',
    paddingBottom: '10px',
    textShadow: '0 0 10px #00ffff',
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
    backgroundColor: 'rgba(10, 14, 39, 0.7)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 0 15px rgba(255, 0, 255, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(5px)',
  },
  rank: {
    fontSize: '28px',
    fontWeight: '900',
    fontFamily: "'Impact', 'Arial Black', sans-serif",
    color: '#ff00ff',
    minWidth: '60px',
    textShadow: '0 0 10px #ff00ff',
  },
  playerName: {
    fontSize: '22px',
    fontWeight: 'bold',
    fontFamily: "'Impact', 'Arial Black', sans-serif",
    color: '#fff',
    flex: 1,
    textTransform: 'uppercase',
    textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
  },
  networth: {
    fontSize: '20px',
    fontWeight: 'bold',
    fontFamily: "'Courier New', monospace",
    color: '#00ffff',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '5px 10px',
    border: '2px solid #00ffff',
    boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
    textShadow: '0 0 5px #00ffff',
  },
};

export default GameOverlay;
