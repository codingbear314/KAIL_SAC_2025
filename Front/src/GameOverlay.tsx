
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
    backdropFilter: 'blur(20px)',
    backgroundImage: `
      radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 4px,
        rgba(255,0,255,0.03) 4px,
        rgba(255,0,255,0.03) 8px
      ),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 4px,
        rgba(0,255,255,0.03) 4px,
        rgba(0,255,255,0.03) 8px
      )
    `,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '40px',
    padding: '60px 70px',
    backgroundColor: 'rgba(10, 14, 39, 0.85)',
    border: '3px solid rgba(255, 0, 255, 0.5)',
    borderRadius: '12px',
    boxShadow: `
      0 0 60px rgba(255, 0, 255, 0.4),
      0 0 100px rgba(0, 255, 255, 0.2),
      inset 0 0 60px rgba(0, 0, 0, 0.5)
    `,
    backdropFilter: 'blur(15px)',
  },
  gameOverText: {
    color: '#fff',
    fontSize: '72px',
    fontWeight: '700',
    margin: 0,
    fontFamily: "'SF Pro Display', -apple-system, 'Segoe UI', system-ui, sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '6px',
    background: 'linear-gradient(135deg, #ff00ff, #00ffff, #ff00ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: 'drop-shadow(0 0 30px rgba(255, 0, 255, 0.6)) drop-shadow(0 0 15px rgba(0, 255, 255, 0.4))',
    padding: '20px 0',
  },
  startButton: {
    padding: '18px 50px',
    fontSize: '28px',
    fontWeight: '600',
    backgroundColor: 'rgba(10, 14, 39, 0.8)',
    color: '#00ffff',
    border: '2px solid #00ffff',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 0 30px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.1)',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    fontFamily: "'SF Pro Display', -apple-system, 'Segoe UI', system-ui, sans-serif",
    textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
  },
  leaderboardContainer: {
    width: '100%',
    maxWidth: '650px',
  },
  leaderboardTitle: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: '25px',
    fontFamily: "'SF Pro Display', -apple-system, 'Segoe UI', system-ui, sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '3px',
    background: 'linear-gradient(90deg, #ff00ff, #00ffff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    paddingBottom: '15px',
    borderBottom: '2px solid rgba(0, 255, 255, 0.3)',
  },
  leaderboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  leaderboardEntry: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '18px 25px',
    backgroundColor: 'rgba(10, 14, 39, 0.6)',
    border: '2px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    boxShadow: `
      0 4px 15px rgba(0, 0, 0, 0.3),
      inset 0 0 20px rgba(0, 0, 0, 0.3),
      0 0 10px rgba(255, 0, 255, 0.1)
    `,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease',
  },
  rank: {
    fontSize: '32px',
    fontWeight: '700',
    fontFamily: "'SF Pro Display', -apple-system, 'Segoe UI', system-ui, sans-serif",
    color: '#fff',
    minWidth: '70px',
    textShadow: '0 0 15px rgba(255, 0, 255, 0.8)',
  },
  playerName: {
    fontSize: '22px',
    fontWeight: '600',
    fontFamily: "'SF Pro Display', -apple-system, 'Segoe UI', system-ui, sans-serif",
    color: '#fff',
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    textShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
  },
  networth: {
    fontSize: '22px',
    fontWeight: '600',
    fontFamily: "'SF Mono', 'Monaco', 'Consolas', monospace",
    color: '#00ffff',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '8px 16px',
    border: '2px solid rgba(0, 255, 255, 0.4)',
    borderRadius: '6px',
    boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)',
    textShadow: '0 0 8px rgba(0, 255, 255, 0.6)',
    fontFeatureSettings: "'tnum'",
  },
};

export default GameOverlay;
