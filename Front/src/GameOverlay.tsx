
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
        {isGameOver && (
          <h1 style={styles.gameOverText}>Game Over!</h1>
        )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  gameOverText: {
    color: 'white',
    fontSize: '64px',
    fontWeight: 'bold',
    margin: 0,
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
  },
  startButton: {
    padding: '20px 60px',
    fontSize: '32px',
    fontWeight: 'bold',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
};

export default GameOverlay;
