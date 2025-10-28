import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5001';

export interface PlayerState {
  player_id: string;
  fund_a: {
    cash: number;
    shares: number;
    value: number;
  };
  networth: number;
}

export interface LeaderboardEntry {
  player_id: string;
  networth: number;
  type: 'human' | 'ai';
}

export interface GameState {
  current_tick: number;
  stock_a: {
    symbol: string;
    price: number;
  };
  players: Record<string, PlayerState>;
  leaderboard: LeaderboardEntry[];
  game_running: boolean;
}

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string>('');

  useEffect(() => {
    const socketInstance = io(SOCKET_URL);

    socketInstance.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    socketInstance.on('connection_status', (data: { status: string; client_id: string }) => {
      setPlayerId(data.client_id);
    });

    socketInstance.on('game_update', (state: GameState) => {
      setGameState(state);
    });

    socketInstance.on('game_started', (data: any) => {
      console.log('Game started:', data);
      setGameState(data.initial_state);
    });

    socketInstance.on('game_over', (data: any) => {
      console.log('Game over:', data);
      setGameState(data.final_state);
    });

    socketInstance.on('player_joined', (data: any) => {
      console.log('Player joined:', data);
      if (data.initial_state) {
        setGameState(data.initial_state);
      }
    });

    socketInstance.on('action_success', (data: any) => {
      console.log('Action success:', data);
    });

    socketInstance.on('action_failed', (data: any) => {
      console.log('Action failed:', data);
    });

    socketInstance.on('error', (data: any) => {
      console.error('Error:', data.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinGame = (playerIdOverride?: string) => {
    if (socket) {
      socket.emit('join_game', { player_id: playerIdOverride || playerId });
    }
  };

  const startGame = (stockA?: string) => {
    if (socket) {
      socket.emit('start_game', { stock_a: stockA });
    }
  };

  const playerAction = (playerId: string, fund: 'a', action: 'all_in' | 'all_out') => {
    if (socket) {
      socket.emit('player_action', {
        player_id: playerId,
        fund,
        action
      });
    }
  };

  const getGameState = () => {
    if (socket) {
      socket.emit('get_game_state');
    }
  };

  return {
    socket,
    connected,
    gameState,
    playerId,
    joinGame,
    startGame,
    playerAction,
    getGameState
  };
};
