import React, { useEffect, useState } from 'react';
import Chart from './Chart';
import Scoreboard from './Scoreboard';
import GameOverlay from './GameOverlay';
import { useSocket } from './hooks/useSocket';
import './App.css';

const GAME_DURATION = 180; // 3 minutes
const TICK_RATE = 15; // Server tick rate (Hz)
const MAX_TICKS = TICK_RATE * GAME_DURATION; // 2700 ticks

// Keyboard controls mapping
const CONTROLS: Record<string, { player: string; fund: 'a' | 'b'; action: 'all_in' | 'all_out' }> = {
  'q': { player: 'Player 1', fund: 'a', action: 'all_in' },
  'w': { player: 'Player 1', fund: 'a', action: 'all_out' },
  'e': { player: 'Player 1', fund: 'b', action: 'all_in' },
  'r': { player: 'Player 1', fund: 'b', action: 'all_out' },
  't': { player: 'Player 2', fund: 'a', action: 'all_in' },
  'y': { player: 'Player 2', fund: 'a', action: 'all_out' },
  'u': { player: 'Player 2', fund: 'b', action: 'all_in' },
  'i': { player: 'Player 2', fund: 'b', action: 'all_out' },
};

const GamePage: React.FC = () => {
  const {
    connected,
    gameState,
    playerId,
    joinGame,
    startGame,
    playerAction
  } = useSocket();

  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const [gameStatus, setGameStatus] = useState<'prepare' | 'playing' | 'ended'>('prepare');

  useEffect(() => {
    if (connected && playerId) {
      joinGame();
    }
  }, [connected, playerId]);

  // Calculate time remaining based on server tick
  useEffect(() => {
    // Only respond to game state changes when in prepare or playing states
    // Ended state is manually controlled
    if (gameStatus === 'ended') return;
    
    if (gameState?.game_running && gameState.current_tick !== undefined) {
      const ticksRemaining = Math.max(0, MAX_TICKS - gameState.current_tick);
      const secondsRemaining = Math.floor(ticksRemaining / TICK_RATE);
      setTimeRemaining(secondsRemaining);
      
      // Transition from prepare to playing when game starts
      if (gameStatus === 'prepare') {
        setGameStatus('playing');
      }
      
      // Transition from playing to ended when timer reaches 0
      if (secondsRemaining === 0 && gameStatus === 'playing') {
        setGameStatus('ended');
      }
    } else if (!gameState?.game_running && gameStatus === 'playing') {
      // Game stopped unexpectedly while playing - transition to ended
      setGameStatus('ended');
    }
  }, [gameState?.current_tick, gameState?.game_running, gameStatus]);

  // Format timer as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!gameState?.game_running) return;

      const control = CONTROLS[event.key.toLowerCase()];
      if (control) {
        playerAction(control.player, control.fund, control.action);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState?.game_running, playerAction]);

  const handleStartGame = () => {
    // Don't change status here - let the useEffect handle it when game actually starts
    startGame();
  };

  const handlePlayAgain = () => {
    setGameStatus('prepare');
    setTimeRemaining(GAME_DURATION);
  };

  return (
    <div style={styles.container}>
      {gameStatus === 'prepare' && (
        <GameOverlay
          onStartGame={handleStartGame}
          isGameOver={false}
          leaderboard={undefined}
        />
      )}
      
      {gameStatus === 'ended' && (
        <GameOverlay
          onStartGame={handlePlayAgain}
          isGameOver={true}
          leaderboard={gameState?.leaderboard}
        />
      )}

      <div style={styles.sidebar}>
        <div style={styles.timerSection}>
          <div style={styles.timerLabel}>TIME</div>
          <div style={styles.timer}>{formatTime(timeRemaining)}</div>
        </div>

        {gameState && (
          <Scoreboard
            leaderboard={gameState.leaderboard}
            players={gameState.players}
            currentPriceA={gameState.stock_a.price}
            currentPriceB={gameState.stock_b.price}
          />
        )}
      </div>

      <div style={styles.mainContent}>
        <div style={styles.chartsGrid}>
          <div style={styles.chartContainer}>
            <Chart currentPrice={gameState?.stock_a.price || 0} />
          </div>
          <div style={styles.chartContainer}>
            <Chart currentPrice={gameState?.stock_b.price || 0} />
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
