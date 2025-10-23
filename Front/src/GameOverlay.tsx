
// TODO: add Tutorial stuff.

import React from 'react';

interface GameOverlayProps {
  onStartGame: () => void;
  isGameOver: boolean;
}

const GameOverlay: React.FC<GameOverlayProps> = ({ onStartGame, isGameOver }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        {isGameOver && <h1 style={styles.gameOverText}>Game Over!</h1>}
        <button onClick={onStartGame} style={styles.startButton}>
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
};

export default GameOverlay;
