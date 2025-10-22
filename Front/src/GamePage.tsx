import React, { useState, useEffect } from 'react';
import Chart from './Chart';
import Scoreboard from './Scoreboard';
import GameOverlay from './GameOverlay';
import { useWebSocket } from './hooks/useWebSocket';
import { parseCSV, getRandomStockFiles } from './utils/stockData';
import './App.css';

const SEED_MONEY = 10000;
const GAME_DURATION = 180; // 3 minutes in seconds

const GamePage: React.FC = () => {
  // Game state
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const [stockPrices1, setStockPrices1] = useState<number[]>([]);
  const [stockPrices2, setStockPrices2] = useState<number[]>([]);
  
  // Get data from 2 charts
  const chart1 = useWebSocket({ 
    chartId: 1, 
    stockPrices: stockPrices1, 
    isGameRunning,
    gameStartTime 
  });
  const chart2 = useWebSocket({ 
    chartId: 2, 
    stockPrices: stockPrices2, 
    isGameRunning,
    gameStartTime 
  });

  // Track current prices for the scoreboard
  const [chartPrices, setChartPrices] = useState({
    1: 0,
    2: 0,
  });

  // Update prices when new data arrives
  useEffect(() => {
    setChartPrices({
      1: chart1.currentPrice || 0,
      2: chart2.currentPrice || 0,
    });
  }, [chart1.currentPrice, chart2.currentPrice]);

  // Game timer
  useEffect(() => {
    if (!isGameRunning) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
      const remaining = Math.max(0, GAME_DURATION - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setIsGameRunning(false);
        console.log('Game Over!');
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isGameRunning, gameStartTime]);

  // Start game function
  const startGame = async () => {
    console.log('Starting game...');
    
    // Load random stock data
    const [file1, file2] = getRandomStockFiles();
    console.log(`Loading stocks: ${file1}, ${file2}`);
    
    const [prices1, prices2] = await Promise.all([
      parseCSV(file1),
      parseCSV(file2)
    ]);
    
    if (prices1.length === 0 || prices2.length === 0) {
      console.error('Failed to load stock data');
      return;
    }
    
    setStockPrices1(prices1);
    setStockPrices2(prices2);
    setTimeRemaining(GAME_DURATION);
    setGameStartTime(Date.now());
    setIsGameRunning(true);
    
    // TODO: Reset player positions
    console.log('Game started!');
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      
      // Player 2 controls (QWER)
      if (key === 'q') {
        handleBuy(2, 1); // Buy Chart 1
      } else if (key === 'w') {
        handleSell(2, 1); // Sell Chart 1
      } else if (key === 'e') {
        handleBuy(2, 2); // Buy Chart 2
      } else if (key === 'r') {
        handleSell(2, 2); // Sell Chart 2
      }
      
      // Player 3 controls (TYUI)
      else if (key === 't') {
        handleBuy(3, 1); // Buy Chart 1
      } else if (key === 'y') {
        handleSell(3, 1); // Sell Chart 1
      } else if (key === 'u') {
        handleBuy(3, 2); // Buy Chart 2
      } else if (key === 'i') {
        handleSell(3, 2); // Sell Chart 2
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleBuy = (playerId: number, chartId: number) => {
    console.log(`Player ${playerId} buying on chart ${chartId}`);
    // TODO: Implement buy logic
  };

  const handleSell = (playerId: number, chartId: number) => {
    console.log(`Player ${playerId} selling on chart ${chartId}`);
    // TODO: Implement sell logic
  };

  // Format timer as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      {/* Game Overlay - shown when game is not running */}
      {!isGameRunning && (
        <GameOverlay 
          onStartGame={startGame} 
          isGameOver={timeRemaining === 0}
        />
      )}

      {/* Left Sidebar - Scoreboard */}
      <div style={styles.sidebar}>
        <Scoreboard chartPrices={chartPrices} />
      </div>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        {/* Header with Timer */}
        <header style={styles.header}>
          <div style={styles.timer}>{formatTime(timeRemaining)}</div>
        </header>

        {/* Charts Grid - 1x2 layout */}
        <div style={styles.chartsGrid}>
          <div style={styles.chartContainer}>
            <Chart chartId={1} data={chart1.data} currentPrice={chart1.currentPrice} />
          </div>
          <div style={styles.chartContainer}>
            <Chart chartId={2} data={chart2.data} currentPrice={chart2.currentPrice} />
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
    backgroundColor: '#f0f0f0',
  },
  sidebar: {
    width: '300px',
    backgroundColor: '#e0e0e0',
    padding: '20px',
    borderRight: '2px solid #999',
    overflowY: 'auto',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#d0d0d0',
    padding: '20px',
    textAlign: 'center',
    borderBottom: '2px solid #999',
  },
  timer: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'monospace',
  },
  chartsGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '20px',
    padding: '20px',
    overflow: 'auto',
  },
  chartContainer: {
    backgroundColor: '#e8e8e8',
    border: '2px solid #999',
    borderRadius: '4px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
  },
};

export default GamePage;