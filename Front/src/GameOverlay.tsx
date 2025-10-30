
// TODO: add Tutorial stuff.

import React, { useState } from 'react';
import type { LeaderboardEntry } from './hooks/useSocket';

interface GameOverlayProps {
  overlayBtn: (config?: PlayerConfig) => void;
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
      playerNames[i] ?? `Player ${i + 1}`
    );
    setPlayerNames(newNames);
    const sanitizedNames = newNames.map((name, i) => name.trim() || `Player ${i + 1}`);
    onPlayerConfigChange?.({ numPlayers: count, playerNames: sanitizedNames });
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
    const sanitizedNames = newNames.map((playerName, i) => playerName.trim() || `Player ${i + 1}`);
    onPlayerConfigChange?.({ numPlayers, playerNames: sanitizedNames });
  };

  const handleStartGame = () => {
    // Ensure we only send the names for active players
    const activePlayerNames = playerNames.slice(0, numPlayers).map((name, i) =>
      name.trim() || `Player ${i + 1}`
    );
    const config = { numPlayers, playerNames: activePlayerNames };
    onPlayerConfigChange?.(config);
    overlayBtn(config);
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
    <div style={styles.content}>
      {!isGameOver ? (
          // Start Screen
          <>
            <div style={styles.startScreenLayout}>
              <div style={styles.logoPlaceholder}>
                <div style={styles.logoText}>KAIL</div>
                <div style={styles.logoSubtext}>천하제일 단타대회 (로고 삽입 예정)</div>
              </div>
              
              <div style={styles.configSection}>
                <h2 style={styles.configTitle}>설정</h2>
                
                <div style={styles.playerCountSection}>
                  <label style={styles.label}>플레이어 수:</label>
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
                  <label style={styles.label}>이름을 입력하세요</label>
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
              시작
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
                <h2 style={styles.leaderboardTitle}>🏆 All-Time Top 5</h2>
                <div style={styles.leaderboardList}>
                  {globalLeaderboard.length > 0 ? (
                    globalLeaderboard.slice(0, 5).map((entry, index) => (
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
            <button onClick={() => overlayBtn()} style={styles.startButton}>
              Play Again
            </button>
          </>
        )}
      </div>
    );
  };
  
  const styles: { [key: string]: React.CSSProperties } = {
  content: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '40px',
    padding: '60px 80px',
    backgroundColor: 'rgba(10, 14, 39, 0.95)',
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
    clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 30px rgba(255, 0, 255, 0.3), inset 0 0 30px rgba(0, 0, 0, 0.5)',
  },
  logoText: {
    fontSize: '48px',
    fontWeight: 'normal',
    fontFamily: "'NeoDunggeunmo', monospace",
    background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '4px',
  },
  logoSubtext: {
    fontSize: '20px',
    fontWeight: 'normal',
    color: '#fff',
    fontFamily: "'NeoDunggeunmo', monospace",
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
    fontSize: '28px',
    fontWeight: 'normal',
    color: '#fff',
    fontFamily: "'NeoDunggeunmo', monospace",
    marginBottom: '10px',
    textAlign: 'left',
  },
  playerCountSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  label: {
    fontSize: '16px',
    fontWeight: 'normal',
    color: '#00ffff',
    fontFamily: "'NeoDunggeunmo', monospace",
    letterSpacing: '1px',
  },
  playerCountButtons: {
    display: 'flex',
    gap: '15px',
  },
  countButton: {
    width: '60px',
    height: '60px',
    fontSize: '20px',
    fontWeight: 'normal',
    backgroundColor: 'rgba(10, 14, 39, 0.6)',
    color: '#fff',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'NeoDunggeunmo', monospace",
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
    fontSize: '16px',
    fontWeight: 'normal',
    backgroundColor: 'rgba(10, 14, 39, 0.6)',
    color: '#fff',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
    fontFamily: "'NeoDunggeunmo', monospace",
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
    fontSize: '56px',
    fontWeight: 'normal',
    margin: 0,
    fontFamily: "'NeoDunggeunmo', monospace",
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
    fontSize: '20px',
    fontWeight: 'normal',
    backgroundColor: 'rgba(10, 14, 39, 0.8)',
    color: '#00ffff',
    border: '2px solid #00ffff',
    clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
    cursor: 'pointer',
    boxShadow: '0 0 30px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.1)',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontFamily: "'NeoDunggeunmo', monospace",
    textShadow: '0 0 10px rgba(0, 255, 255, 0.8)',
  },
  leaderboardContainer: {
    width: '100%',
    maxWidth: '650px',
  },
  leaderboardTitle: {
    fontSize: '28px',
    fontWeight: 'normal',
    color: '#fff',
    textAlign: 'center',
    marginBottom: '25px',
    fontFamily: "'NeoDunggeunmo', monospace",
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
    clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)',
    boxShadow: `
      0 4px 15px rgba(0, 0, 0, 0.3),
      inset 0 0 20px rgba(0, 0, 0, 0.3),
      0 0 10px rgba(255, 0, 255, 0.1)
    `,
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease',
  },
  rank: {
    fontSize: '28px',
    fontWeight: 'normal',
    fontFamily: "'NeoDunggeunmo', monospace",
    color: '#fff',
    minWidth: '70px',
    textShadow: '0 0 15px rgba(255, 0, 255, 0.8)',
  },
  playerName: {
    fontSize: '18px',
    fontWeight: 'normal',
    fontFamily: "'NeoDunggeunmo', monospace",
    color: '#fff',
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
  },
  networth: {
    fontSize: '18px',
    fontWeight: 'normal',
    fontFamily: "'NeoDunggeunmo', monospace",
    color: '#00ffff',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '8px 16px',
    border: '2px solid rgba(0, 255, 255, 0.4)',
    clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
    boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)',
    textShadow: '0 0 8px rgba(0, 255, 255, 0.6)',
    fontFeatureSettings: "'tnum'",
  },
};

export default GameOverlay;
