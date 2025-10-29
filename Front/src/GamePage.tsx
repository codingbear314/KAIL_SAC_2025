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

interface PlayerConfig {
  numPlayers: number;
  playerNames: string[];
}

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
  const [playerConfig, setPlayerConfig] = useState<PlayerConfig | null>(null);

  useEffect(() => {
    if (connected && playerId && playerConfig) {
      // Join with configured players
      joinGame(playerConfig);
    }
  }, [connected, playerId, playerConfig]);

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
        // Check if player is active (exists in playerConfig)
        if (playerConfig) {
          const playerIndex = parseInt(control.player.split(' ')[1]) - 1;
          if (playerIndex >= playerConfig.numPlayers) {
            // Player is not active in this game
            return;
          }
          // Use the custom player name if available
          const actualPlayerName = playerConfig.playerNames[playerIndex] || control.player;
          const player = serverGameState.players[actualPlayerName];
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
          
          playerAction(actualPlayerName, control.fund, control.action);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [serverGameState?.game_running, serverGameState?.players, playerAction, playBuySound, playSellSound, playerConfig]);

  const handleStartGame = () => {
    // Trigger chart reset when starting game
    setChartResetSignal(Date.now());
    startGame();
  };

  const handlePlayerConfigChange = (config: PlayerConfig) => {
    console.log('Player configuration:', config);
    setPlayerConfig(config);
  };

  const handlePlayAgain = () => {
    setTimeRemaining(GAME_DURATION);
    console.log('Preparing for new game');
    setClientGameStatus('prepare');
    setPlayerConfig(null);
  };

  return (
    <div style={styles.container}>
      {clientGameState === 'prepare' && (
        <GameOverlay
          overlayBtn={handleStartGame}
          isGameOver={false}
          leaderboard={undefined}
          onPlayerConfigChange={handlePlayerConfigChange}
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
          <div style={styles.timer}>{formatTime(timeRemaining)}</div>
          <div style={{
            ...styles.timerUnderline,
            width: `${(timeRemaining / GAME_DURATION) * 100}%`,
            backgroundSize: `${100 / (timeRemaining / GAME_DURATION)}% 100%`,
          }}></div>
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
    backgroundColor: '#0a0e27',
    overflow: 'hidden',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    backgroundImage: `
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
  sidebar: {
    width: '280px',
    background: 'linear-gradient(to right, #0a0e27, #1a2850)',
    padding: '25px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    boxShadow: 'inset -5px 0 15px rgba(0, 0, 0, 0.3)',
  },
  timerSection: {
    backgroundColor: '#0a0e27',
    padding: '25px',
    textAlign: 'center',
    position: 'relative',
    borderRadius: '8px',
    border: '2px solid rgba(255, 0, 255, 0.3)',
    boxShadow: '0 0 20px rgba(255, 0, 255, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.5)',
  },
  timerLabel: {
    fontSize: '14px',
    fontWeight: 'normal',
    color: '#00ffff',
    letterSpacing: '2px',
    marginBottom: '10px',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff',
  },
  timer: {
    fontSize: '32px',
    fontWeight: 'normal',
    background: 'linear-gradient(to right, #ff00ff, #00ffff, #ff00ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    letterSpacing: '4px',
    textShadow: 'none',
    filter: 'drop-shadow(0 0 20px rgba(255, 0, 255, 0.6)) drop-shadow(0 0 10px rgba(0, 255, 255, 0.4))',
  },
  timerUnderline: {
    height: '4px',
    background: 'linear-gradient(to right, #ff00ff, #00ffff, #ff00ff)',
    marginTop: '15px',
    boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
    transition: 'width 0.5s linear',
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
  },
  chartContainer: {
    flex: 1,
    backgroundColor: '#0a0e27',
    borderRadius: '0px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    position: 'relative',
  },
};

export default GamePage;
