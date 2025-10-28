import React, { useEffect, useState } from 'react';
import Chart from './Chart';
import Scoreboard from './Scoreboard';
import GameOverlay from './GameOverlay';
import { useSocket } from './hooks/useSocket';
import { useSounds } from './hooks/useSounds';
import './App.css';

const GAME_DURATION = 180; // 3 minutes
const TICK_RATE = 15; // Server tick rate (Hz)
const MAX_TICKS = TICK_RATE * GAME_DURATION; // 2700 ticks

// Keyboard controls mapping - 4 players, 1 fund each
const CONTROLS: Record<string, { player: string; fund: 'a'; action: 'all_in' | 'all_out' }> = {
  'q': { player: 'Player 1', fund: 'a', action: 'all_in' },
  'w': { player: 'Player 1', fund: 'a', action: 'all_out' },
  'e': { player: 'Player 2', fund: 'a', action: 'all_in' },
  'r': { player: 'Player 2', fund: 'a', action: 'all_out' },
  't': { player: 'Player 3', fund: 'a', action: 'all_in' },
  'y': { player: 'Player 3', fund: 'a', action: 'all_out' },
  'u': { player: 'Player 4', fund: 'a', action: 'all_in' },
  'i': { player: 'Player 4', fund: 'a', action: 'all_out' },
};

const GamePage: React.FC = () => {
  const {
    connected,
    gameState: serverGameState,
    playerId,
    joinGame,
    startGame,
    playerAction
  } = useSocket();

  const { playBuySound, playSellSound } = useSounds();

  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const [clientGameState, setClientGameStatus] = useState<'prepare' | 'playing' | 'ended'>('prepare');
  const [chartResetSignal, setChartResetSignal] = useState<number>(0);

  useEffect(() => {
    if (connected && playerId) {
      joinGame();
    }
  }, [connected, playerId]);

  // Game timer management
  useEffect(() => {
    if (clientGameState === 'ended') return;
    
    if (serverGameState?.game_running && serverGameState.current_tick !== undefined) {
      const ticksRemaining = Math.max(0, MAX_TICKS - serverGameState.current_tick);
      const secondsRemaining = Math.floor(ticksRemaining / TICK_RATE);
      setTimeRemaining(secondsRemaining);

      if (clientGameState === 'prepare') {
        console.log('Game has started');
        setClientGameStatus('playing');
      }
    } else if (!serverGameState?.game_running && clientGameState === 'playing') {
      setClientGameStatus('ended');
    }
  }, [serverGameState?.current_tick, serverGameState?.game_running, clientGameState]);

  // Format timer as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!serverGameState?.game_running) return;

      const control = CONTROLS[event.key.toLowerCase()];
      if (control) {
        // Check if action will succeed before playing sound
        const player = serverGameState.players[control.player];
        if (!player) return;

        let willSucceed = false;
        if (control.action === 'all_in') {
          // Can only buy if has cash
          willSucceed = player.fund_a.cash > 0;
        } else if (control.action === 'all_out') {
          // Can only sell if has shares
          willSucceed = player.fund_a.shares > 0;
        }

        // Only play sound if action will succeed
        if (willSucceed) {
          if (control.action === 'all_in') {
            playBuySound();
          } else if (control.action === 'all_out') {
            playSellSound();
          }
        }
        
        playerAction(control.player, control.fund, control.action);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [serverGameState?.game_running, playerAction, playBuySound, playSellSound]);

  const handleStartGame = () => {
    // Trigger chart reset when starting game
    setChartResetSignal(Date.now());
    startGame();
  };

  const handlePlayAgain = () => {
    setTimeRemaining(GAME_DURATION);
    console.log('Preparing for new game');
    setClientGameStatus('prepare');
  };

  return (
    <div style={styles.container}>
      {clientGameState === 'prepare' && (
        <GameOverlay
          overlayBtn={handleStartGame}
          isGameOver={false}
          leaderboard={undefined}
        />
      )}
      
      {clientGameState === 'ended' && (
        <GameOverlay
          overlayBtn={handlePlayAgain}
          isGameOver={true}
          leaderboard={serverGameState?.leaderboard}
        />
      )}

      <div style={styles.sidebar}>
        <div style={styles.timerSection}>
          <div style={styles.timerLabel}>TIME</div>
          <div style={styles.timer}>{formatTime(timeRemaining)}</div>
        </div>

        {serverGameState && (
          <Scoreboard
            leaderboard={serverGameState.leaderboard}
            players={serverGameState.players}
            currentPriceA={serverGameState.stock_a.price}
          />
        )}
      </div>

      <div style={styles.mainContent}>
        <div style={styles.chartsGrid}>
          <div style={{...styles.chartContainer, padding: '20px'}}>
            <Chart 
              currentPrice={serverGameState?.stock_a.price || 0}
              resetSignal={chartResetSignal}
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
