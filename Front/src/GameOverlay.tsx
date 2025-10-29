
// TODO: add Tutorial stuff.

import React, { useState } from 'react';
import type { LeaderboardEntry } from './hooks/useSocket';

interface GameOverlayProps {
  overlayBtn: () => void;
  isGameOver: boolean;
  leaderboard?: LeaderboardEntry[];
  onPlayerConfigChange?: (config: PlayerConfig) => void;
  latestGlobalTop10?: any[] | null;
}

export interface PlayerConfig {
  numPlayers: number;
  playerNames: string[];
}

const GameOverlay: React.FC<GameOverlayProps> = ({ 
  overlayBtn, 
  isGameOver, 
  leaderboard,
  onPlayerConfigChange,
  latestGlobalTop10
}) => {
  const [numPlayers, setNumPlayers] = useState(4);
  const [playerNames, setPlayerNames] = useState(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);

  const handlePlayerCountChange = (count: number) => {
    setNumPlayers(count);
    const newNames = Array.from({ length: count }, (_, i) => 
      playerNames[i] || `Player ${i + 1}`
    );
    setPlayerNames(newNames);
    onPlayerConfigChange?.({ numPlayers: count, playerNames: newNames });
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    // Only use custom name if it's not empty after trimming
    newNames[index] = name.trim() || `Player ${index + 1}`;
    setPlayerNames(newNames);
    onPlayerConfigChange?.({ numPlayers, playerNames: newNames });
  };

  const handleStartGame = () => {
    // Ensure we only send the names for active players
    const activePlayerNames = playerNames.slice(0, numPlayers).map((name, i) => 
      name.trim() || `Player ${i + 1}`
    );
    onPlayerConfigChange?.({ numPlayers, playerNames: activePlayerNames });
    overlayBtn();
  };

  // Use latestGlobalTop10 if provided via socket payload, otherwise fetch when game ends
  React.useEffect(() => {
    if (!isGameOver) return;

    if ((latestGlobalTop10 as any) && (latestGlobalTop10 as any).length > 0) {
      setGlobalLeaderboard(latestGlobalTop10 as any);
      return;
    }

    fetch('http://localhost:5001/api/leaderboard/global')
      .then(res => res.json())
      .then(data => setGlobalLeaderboard(data))
      .catch(err => console.error('Failed to fetch global leaderboard:', err));
  }, [isGameOver, (latestGlobalTop10 as any)]);
  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        {!isGameOver ? (
          // Start Screen
          <>
            <div style={styles.startScreenLayout}>
              <div style={styles.logoPlaceholder}>
                <div style={styles.logoText}>STOCK</div>
                <div style={styles.logoSubtext}>ARENA</div>
              </div>
              
              <div style={styles.configSection}>
                <h2 style={styles.configTitle}>Game Setup</h2>
                
                <div style={styles.playerCountSection}>
                  <label style={styles.label}>Number of Players:</label>
                  <div style={styles.playerCountButtons}>
                    {[1, 2, 3, 4].map(count => (
                      <button
                        key={count}
                        onClick={() => handlePlayerCountChange(count)}
                        style={{
                          ...styles.countButton,
                          ...(numPlayers === count ? styles.countButtonActive : {})
                        }}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.nameInputSection}>
                  <label style={styles.label}>Player Names:</label>
                  {Array.from({ length: numPlayers }).map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      value={playerNames[i] || ''}
                      onChange={(e) => handleNameChange(i, e.target.value)}
                      placeholder={`Player ${i + 1}`}
                      style={styles.nameInput}
                      maxLength={20}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <button onClick={handleStartGame} style={styles.startButton}>
              Start Game
            </button>
          </>
        ) : (
          // Game Over Screen
          <>
            <h1 style={styles.gameOverText}>Game Ended</h1>
            <div style={styles.leaderboardsContainer}>
              {leaderboard && leaderboard.length > 0 && (
                <div style={styles.leaderboardContainer}>
                  <h2 style={styles.leaderboardTitle}>Match Results</h2>
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

              <div style={styles.leaderboardContainer}>
                <h2 style={styles.leaderboardTitle}>🏆 All-Time Top 10</h2>
                <div style={styles.leaderboardList}>
                  {globalLeaderboard.length > 0 ? (
                    globalLeaderboard.slice(0, 10).map((entry, index) => (
                      <div key={`${entry.player_id}-${index}`} style={styles.leaderboardEntry}>
                        <span style={styles.rank}>#{index + 1}</span>
                        <span style={styles.playerName}>
                          {entry.player_id === 'AI' ? 'AI Agent' : entry.player_id}
                        </span>
                        <span style={styles.networth}>
                          ${Math.floor(entry.networth).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                      No entries yet
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button onClick={overlayBtn} style={styles.startButton}>
              Play Again
            </button>
          </>
        )}
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
    gap: '28px',
    padding: '42px 49px',
    backgroundColor: 'rgba(10, 14, 39, 0.85)',
    border: '3px solid rgba(255, 0, 255, 0.5)',
    borderRadius: '12px',
    boxShadow: `
      0 0 60px rgba(255, 0, 255, 0.4),
      0 0 100px rgba(0, 255, 255, 0.2),
      inset 0 0 60px rgba(0, 0, 0, 0.5)
    `,
    backdropFilter: 'blur(15px)',
    maxWidth: '840px',
    width: '90%',
    transform: 'scale(0.7)',
  },
  startScreenLayout: {
    display: 'flex',
    gap: '60px',
    alignItems: 'center',
    width: '100%',
  },
  logoPlaceholder: {
    width: '280px',
    height: '280px',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    border: '3px solid rgba(255, 0, 255, 0.4)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 30px rgba(255, 0, 255, 0.3), inset 0 0 30px rgba(0, 0, 0, 0.5)',
  },
  logoText: {
    fontSize: '32px',
    fontWeight: 'normal',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '4px',
  },
  logoSubtext: {
    fontSize: '16px',
    fontWeight: 'normal',
    color: '#fff',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    letterSpacing: '8px',
    marginTop: '8px',
  },
  configSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  configTitle: {
    fontSize: '20px',
    fontWeight: 'normal',
    color: '#fff',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    marginBottom: '10px',
    textAlign: 'left',
  },
  playerCountSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 'normal',
    color: '#00ffff',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    letterSpacing: '1px',
  },
  playerCountButtons: {
    display: 'flex',
    gap: '15px',
  },
  countButton: {
    width: '60px',
    height: '60px',
    fontSize: '16px',
    fontWeight: 'normal',
    backgroundColor: 'rgba(10, 14, 39, 0.6)',
    color: '#fff',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
  },
  countButtonActive: {
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    border: '2px solid #00ffff',
    color: '#00ffff',
    boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
  },
  nameInputSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  nameInput: {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: 'normal',
    backgroundColor: 'rgba(10, 14, 39, 0.6)',
    color: '#fff',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  leaderboardsContainer: {
    display: 'flex',
    gap: '40px',
    width: '100%',
    justifyContent: 'center',
  },
  gameOverText: {
    color: '#fff',
    fontSize: '40px',
    fontWeight: 'normal',
    margin: 0,
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    textTransform: 'uppercase',
    letterSpacing: '4px',
    background: 'linear-gradient(135deg, #ff00ff, #00ffff, #ff00ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: 'drop-shadow(0 0 30px rgba(255, 0, 255, 0.6)) drop-shadow(0 0 15px rgba(0, 255, 255, 0.4))',
    padding: '20px 0',
  },
  startButton: {
    padding: '18px 50px',
    fontSize: '16px',
    fontWeight: 'normal',
    backgroundColor: 'rgba(10, 14, 39, 0.8)',
    color: '#00ffff',
    border: '2px solid #00ffff',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 0 30px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.1)',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
  },
  leaderboardContainer: {
    width: '100%',
    maxWidth: '650px',
  },
  leaderboardTitle: {
    fontSize: '18px',
    fontWeight: 'normal',
    color: '#fff',
    textAlign: 'center',
    marginBottom: '25px',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    textTransform: 'uppercase',
    letterSpacing: '2px',
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
    fontSize: '20px',
    fontWeight: 'normal',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    color: '#fff',
    minWidth: '70px',
    textShadow: '0 0 15px rgba(255, 0, 255, 0.8)',
  },
  playerName: {
    fontSize: '12px',
    fontWeight: 'normal',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
    color: '#fff',
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
  },
  networth: {
    fontSize: '12px',
    fontWeight: 'normal',
    fontFamily: "'Press Start 2P', 'NeoDunggeunmo', monospace",
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
