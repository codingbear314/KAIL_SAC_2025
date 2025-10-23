import React, { useEffect } from 'react';
import Chart from './Chart';
import Scoreboard from './Scoreboard';
import GameOverlay from './GameOverlay';
import { useSocket } from './hooks/useSocket';
import './App.css';

const GamePage: React.FC = () => {
  const {
    connected,
    gameState,
    playerId,
    joinGame,
    startGame,
    playerAction
  } = useSocket();

  useEffect(() => {
    if (connected && playerId) {
      joinGame();
    }
  }, [connected, playerId]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!gameState?.game_running) return;

      const key = event.key.toLowerCase();

      // Player 1 controls (Q/W/E/R)
      if (key === 'q') {
        playerAction('Player 1', 'a', 'all_in');
      } else if (key === 'w') {
        playerAction('Player 1', 'a', 'all_out');
      } else if (key === 'e') {
        playerAction('Player 1', 'b', 'all_in');
      } else if (key === 'r') {
        playerAction('Player 1', 'b', 'all_out');
      }
      // Player 2 controls (T/Y/U/I)
      else if (key === 't') {
        playerAction('Player 2', 'a', 'all_in');
      } else if (key === 'y') {
        playerAction('Player 2', 'a', 'all_out');
      } else if (key === 'u') {
        playerAction('Player 2', 'b', 'all_in');
      } else if (key === 'i') {
        playerAction('Player 2', 'b', 'all_out');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState?.game_running, playerAction]);

  const handleStartGame = () => {
    startGame();
  };

  return (
    <div style={styles.container}>
      {!gameState?.game_running && (
        <GameOverlay
          onStartGame={handleStartGame}
          isGameOver={false}
        />
      )}

      <div style={styles.sidebar}>
        <div style={styles.timerSection}>
          <div style={styles.timerLabel}>LIVE</div>
          <div style={styles.timer}>TICK {gameState?.current_tick || 0}</div>
        </div>

        {gameState && (
          <Scoreboard
            leaderboard={gameState.leaderboard}
            players={gameState.players}
            currentPriceA={gameState.stock_a.price}
            currentPriceB={gameState.stock_b.price}
            stockASymbol={gameState.stock_a.symbol}
            stockBSymbol={gameState.stock_b.symbol}
          />
        )}
      </div>

      <div style={styles.mainContent}>
        <div style={styles.chartsGrid}>
          <div style={styles.chartContainer}>
            <Chart
              chartId={1}
              data={[]}
              currentPrice={gameState?.stock_a.price || 0}
            />
          </div>
          <div style={styles.chartContainer}>
            <Chart
              chartId={2}
              data={[]}
              currentPrice={gameState?.stock_b.price || 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f5f1e8',
    overflow: 'hidden',
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  sidebar: {
    width: '280px',
    backgroundColor: '#e8e3d8',
    padding: '20px',
    borderRight: '3px double #2a2a2a',
    overflowY: 'auto',
    boxShadow: 'inset -5px 0 10px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  timerSection: {
    backgroundColor: '#2a2a2a',
    padding: '20px',
    border: '4px solid #1a1a1a',
    boxShadow: '6px 6px 0 rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
  },
  timerLabel: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#f5f1e8',
    letterSpacing: '4px',
    marginBottom: '10px',
    fontFamily: "'Georgia', serif",
  },
  timer: {
    fontSize: '48px',
    fontWeight: '900',
    color: '#f5f1e8',
    fontFamily: "'Courier New', monospace",
    letterSpacing: '4px',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chartsGrid: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    padding: '15px',
    overflow: 'hidden',
    backgroundImage: `
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0,0,0,0.03) 2px,
        rgba(0,0,0,0.03) 4px
      )
    `,
  },
  chartContainer: {
    flex: 1,
    backgroundColor: '#fefcf7',
    border: '4px solid #2a2a2a',
    borderRadius: '2px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.2)',
    position: 'relative',
  },
};

export default GamePage;
