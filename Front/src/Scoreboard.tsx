import React, { useEffect, useRef } from 'react';
import type { LeaderboardEntry, PlayerState } from './hooks/useSocket';

interface ScoreboardProps {
  leaderboard: LeaderboardEntry[];
  players: Record<string, PlayerState>;
  currentPriceA: number;
}

// This will be filtered based on actual players in the game
const DISPLAY_ORDER = ['AI', 'Player 1', 'Player 2', 'Player 3', 'Player 4'];

// Halftone canvas component
const HalftoneBox: React.FC<{ 
  baseColor: string; 
  dotColor1: string;
  dotColor2: string;
  width: number; 
  height: number;
}> = ({ baseColor, dotColor1, dotColor2, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill base color
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, width, height);

    // First layer: halftone dots with gradient from top-left to bottom-right
    ctx.fillStyle = dotColor1;
    const dotSpacing = 4;
    
    for (let dy = 0; dy < height; dy += dotSpacing) {
      for (let dx = 0; dx < width; dx += dotSpacing) {
        // Gradually change dot size based on position (top-left to bottom-right)
        const progressY = dy / height;
        const progressX = dx / width;
        const progress = (progressY + progressX) / 2;
        const dotSize = 0 + progress * 5; // Range from 0 to 5
        
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

    // Second layer: halftone dots starting from diagonal line moving to bottom-right
    ctx.fillStyle = dotColor2;
    ctx.globalAlpha = 0.6; // Make second layer slightly transparent
    for (let dy = 0; dy < height; dy += dotSpacing) {
      for (let dx = 0; dx < width; dx += dotSpacing) {
        // Progress based on distance from center diagonal
        const progress = Math.max(0, (dx - width/2) / width + (dy - height/2) / height);
        const dotSize = 0 + progress * 8; // Range from 0 to 8
        
        ctx.beginPath();
        ctx.arc(
          dx + ((Math.floor(dy / dotSpacing) % 2) * (dotSpacing / 2)) + dotSpacing / 3, // Offset position
          dy + dotSpacing / 3,
          dotSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1.0; // Reset alpha
  }, [baseColor, dotColor1, dotColor2, width, height]);

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
  
  // Get list of actual players in the game (filter out those who don't exist)
  const activePlayers = DISPLAY_ORDER.filter(playerId => players[playerId]);
  
  // Calculate networth for all active players
  const networthMap: Record<string, number> = {};
  activePlayers.forEach(playerId => {
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
        {activePlayers.map((playerId, index) => {
          const player = players[playerId];
          if (!player) return null;

          const fundAValue = player.fund_a.shares > 0 
            ? player.fund_a.shares * currentPriceA 
            : player.fund_a.value;

          const displayName = playerId === 'AI' ? 'AI Agent' : playerId;

          const baseColors = [
            '#1a0044', // Darkest purple (background)
            '#330033', // Darkest magenta
            '#003344', // Darkest cyan
            '#004400', // Darkest green
            '#440022', // Darkest red
          ];
          
          const dotColors1 = [
            '#5500aa', // Medium purple (first layer)
            '#880088', // Medium magenta
            '#008899', // Medium cyan
            '#008800', // Medium green
            '#880044', // Medium pink
          ];
          
          const dotColors2 = [
            '#8800ff', // Brightest purple (second layer)
            '#cc00cc', // Reduced magenta
            '#00cccc', // Reduced cyan
            '#00cc00', // Reduced green
            '#ff0088', // Brightest pink
          ];

          // Extra emphasis for first place
          const isFirst = rankMap[playerId] === 1;
          
          // Check if player just made a trade (has stocks)
          const hasStocks = player.fund_a.shares > 0;

          return (
            <div key={playerId} style={{
              ...styles.playerCard,
              transform: isFirst ? 'scale(1.05)' : 'scale(1)',
              zIndex: isFirst ? 10 : 1,
              animation: hasStocks ? 'pulse-glow 0.5s ease-out' : 'none',
            }}>
              <HalftoneBox 
                baseColor={baseColors[index % baseColors.length]}
                dotColor1={dotColors1[index % dotColors1.length]}
                dotColor2={dotColors2[index % dotColors2.length]}
                width={280}
                height={75}
              />
              <div style={styles.cardContent}>
                <div style={styles.topRow}>
                  <div style={{
                    ...styles.rankText,
                    ...(isFirst ? styles.firstPlaceRank : {})
                  }}>
                    #{rankMap[playerId]}
                  </div>
                  <div style={styles.playerName}>{displayName}</div>
                </div>
                <div style={styles.bottomRow}>
                  <div style={{
                    ...styles.networthText,
                    ...(player.fund_a.shares > 0 ? styles.stockGlow : {})
                  }}>
                    {formatCurrency(fundAValue)}
                  </div>
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
    padding: '0px',
    position: 'relative',
  },
  scoreboardHeader: {
    marginBottom: '20px',
    position: 'relative',
  },
  headerText: {
    fontSize: '20px',
    fontWeight: 'normal',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    color: '#00ffff',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    textShadow: `
      0 0 20px rgba(0, 255, 255, 0.8),
      0 0 10px rgba(0, 255, 255, 0.6),
      3px 3px 0 rgba(255, 0, 255, 0.5),
      -1px -1px 0 rgba(255, 0, 255, 0.3)
    `,
    transform: 'rotate(-1deg)',
  },
  headerUnderline: {
    height: '4px',
    background: 'linear-gradient(to right, #ff00ff, #00ffff, #ff00ff)',
    marginTop: '8px',
    boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
    transform: 'rotate(-0.5deg)',
  },
  scoreboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    padding: '10px 0',
  },
  playerCard: {
    padding: '12px 12px 12px 18px',
    display: 'flex',
    flexDirection: 'column',
    border: '2px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    boxShadow: `
      0 8px 25px rgba(0, 0, 0, 0.5),
      inset 0 0 30px rgba(255, 255, 255, 0.1),
      inset -3px -3px 10px rgba(0, 0, 0, 0.4),
      inset 3px 3px 10px rgba(255, 255, 255, 0.05),
      0 0 20px rgba(138, 43, 226, 0.2)
    `,
    position: 'relative',
    backdropFilter: 'blur(10px)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  cardContent: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  rankText: {
    fontWeight: 'normal',
    fontSize: '24px',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    color: '#fff',
    textTransform: 'uppercase',
    textShadow: `
      0 0 10px rgba(255, 255, 255, 0.8),
      3px 3px 0 rgba(0, 0, 0, 0.6),
      -1px -1px 0 rgba(0, 0, 0, 0.3)
    `,
    minWidth: '70px',
  },
  firstPlaceRank: {
    fontSize: '28px',
    color: '#ffd700',
    textShadow: `
      0 0 20px rgba(255, 215, 0, 1),
      0 0 10px rgba(255, 215, 0, 0.8),
      3px 3px 0 rgba(0, 0, 0, 0.7),
      -1px -1px 0 rgba(255, 0, 255, 0.3)
    `,
  },
  playerName: {
    fontWeight: 'normal',
    fontSize: '12px',
    color: '#fff',
    flex: 1,
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textShadow: '3px 3px 6px rgba(0, 0, 0, 0.8)',
  },
  sharesText: {
    fontSize: '16px',
    fontWeight: 'normal',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    color: '#fff',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.7), 2px 2px 4px rgba(0, 0, 0, 0.8)',
    minWidth: '80px',
    textAlign: 'right',
  },
  sharesLabel: {
    fontSize: '10px',
    opacity: 0.9,
    marginLeft: '3px',
  },
  bottomRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '6px',
  },
  networthText: {
    fontSize: '16px',
    fontWeight: 'normal',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    color: '#fff',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.7), 3px 3px 6px rgba(0, 0, 0, 0.8)',
  },
  stockGlow: {
    color: '#00ffff',
    textShadow: `
      0 0 20px rgba(0, 255, 255, 1),
      0 0 10px rgba(0, 255, 255, 0.8),
      0 0 5px rgba(0, 255, 255, 0.6),
      3px 3px 6px rgba(0, 0, 0, 0.8)
    `,
  },
};

export default Scoreboard;
