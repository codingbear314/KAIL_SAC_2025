import React, { useEffect, useRef } from 'react';
import type { LeaderboardEntry, PlayerState } from './hooks/useSocket';

interface ScoreboardProps {
  leaderboard: LeaderboardEntry[];
  players: Record<string, PlayerState>;
  currentPriceA: number;
}

const DISPLAY_ORDER = ['AI', 'Player 1', 'Player 2', 'Player 3', 'Player 4'];

// Halftone canvas component
const HalftoneBox: React.FC<{ 
  baseColor: string; 
  dotColor: string; 
  width: number; 
  height: number;
}> = ({ baseColor, dotColor, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill base color
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, width, height);

    // Draw halftone dots with gradient size
    ctx.fillStyle = dotColor;
    const dotSpacing = 3;
    
    for (let dy = 0; dy < height; dy += dotSpacing) {
      for (let dx = 0; dx < width; dx += dotSpacing) {
        // Gradually change dot size based on position
        const progressY = dy / height;
        const progressX = dx / width;
        const progress = (progressY + progressX) / 2;
        const dotSize = 0.3 + progress * 1.5; // Range from 0.3 to 1.8
        
        ctx.beginPath();
        ctx.arc(
          dx + ((Math.floor(dy / dotSpacing) % 2) * (dotSpacing / 2)),
          dy,
          dotSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }, [baseColor, dotColor, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
};

const Scoreboard: React.FC<ScoreboardProps> = ({
  players,
  currentPriceA
}) => {
  const formatCurrency = (value: number) => `$${Math.floor(value).toLocaleString()}`;
  
  // Calculate networth for all players
  const networthMap: Record<string, number> = {};
  DISPLAY_ORDER.forEach(playerId => {
    const player = players[playerId];
    if (player) {
      const fundAValue = player.fund_a.shares > 0 
        ? player.fund_a.shares * currentPriceA 
        : player.fund_a.value;
      networthMap[playerId] = fundAValue;
    }
  });

  // Create rank map based on networth
  const rankMap = Object.fromEntries(
    Object.entries(networthMap)
      .sort((a, b) => b[1] - a[1])
      .map(([id], index) => [id, index + 1])
  );

  return (
    <div style={styles.container}>
      <div style={styles.scoreboardList}>
        {DISPLAY_ORDER.map((playerId, index) => {
          const player = players[playerId];
          if (!player) return null;

          const fundAValue = player.fund_a.shares > 0 
            ? player.fund_a.shares * currentPriceA 
            : player.fund_a.value;

          const displayName = playerId === 'AI' ? 'AI Agent' : playerId;

          const baseColors = [
            '#667eea', // Purple base
            '#f093fb', // Pink base
            '#4facfe', // Cyan base
            '#43e97b', // Green base
            '#fa709a', // Orange base
          ];
          
          const dotColors = [
            '#764ba2', // Purple dots
            '#f5576c', // Pink dots
            '#00f2fe', // Cyan dots
            '#38f9d7', // Green dots
            '#fee140', // Orange dots
          ];

          return (
            <div key={playerId} style={{
              ...styles.playerCard,
            }}>
              <HalftoneBox 
                baseColor={baseColors[index % baseColors.length]}
                dotColor={dotColors[index % dotColors.length]}
                width={260}
                height={100}
              />
              <div style={styles.playerHeader}>
                <div style={styles.rankText}>#{rankMap[playerId]}</div>
                <div style={styles.playerName}>{displayName}</div>
              </div>

              <div style={styles.fundInfo}>
                <div style={{
                  ...styles.fundValue,
                  ...(player.fund_a.shares > 0 ? styles.inStock : styles.inCash)
                }}>
                  <HalftoneBox 
                    baseColor={player.fund_a.shares > 0 ? '#003333' : '#1a1a1a'}
                    dotColor={player.fund_a.shares > 0 ? 'rgba(0, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.2)'}
                    width={200}
                    height={40}
                  />
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    {formatCurrency(fundAValue)}
                  </span>
                </div>
                <div style={styles.shares}>
                  <HalftoneBox 
                    baseColor='#1a1a1a'
                    dotColor='rgba(255, 255, 255, 0.2)'
                    width={80}
                    height={40}
                  />
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    {player.fund_a.shares > 0 ? `${Math.round(player.fund_a.shares)}sh` : '-'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    backgroundColor: '#0a0e27',
    padding: '0px',
    position: 'relative',
  },
  scoreboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  playerCard: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.1)',
    position: 'relative',
    backdropFilter: 'blur(10px)',
  },
  playerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '8px',
    position: 'relative',
    zIndex: 1,
  },
  rankText: {
    fontWeight: 900,
    fontSize: '28px',
    fontFamily: "'Impact', 'Arial Black', sans-serif",
    color: '#fff',
    textTransform: 'uppercase',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 2px 2px 0 rgba(0, 0, 0, 0.5)',
  },
  playerName: {
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#fff',
    flex: 1,
    fontFamily: "'Impact', 'Arial Black', sans-serif",
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
  },
  fundsGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '5px',
  },
  fundInfo: {
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  fundValue: {
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: "'Courier New', monospace",
    color: '#fff',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)',
    textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
    position: 'relative',
  },
  inCash: {},
  inStock: {
    border: '2px solid #00ffff',
    boxShadow: '0 0 10px rgba(0, 255, 255, 0.5), inset 0 0 10px rgba(0, 255, 255, 0.2)',
  },
  shares: {
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    fontSize: '16px',
    textAlign: 'right',
    color: '#fff',
    fontFamily: "'Courier New', monospace",
    fontWeight: 'bold',
    marginLeft: 'auto',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)',
    minWidth: '80px',
    textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
    position: 'relative',
  },
};

export default Scoreboard;
