# KAIL SAC 2025 - Backend

Python Flask + Socket.IO server for real-time stock trading game.

## Setup

```bash
pip install -r requirements.txt
```

## Run Server

```bash
python server.py
```

Server runs on `http://localhost:5000`

## Architecture

- **server.py** - Flask + Socket.IO server with game loop (15 Hz)
- **game_state.py** - Game state management (players, funds, networth)
- **stock_data_loader.py** - CSV data loader for stock prices

## Socket.IO Events

### Client → Server
- `join_game` - Join game as player
- `start_game` - Start new game (optional: specify stock_a, stock_b)
- `player_action` - Execute trade (fund: 'a'/'b', action: 'all_in'/'all_out')
- `navigate_chart` - Navigate charts (fund: 'a'/'b', direction: 'next'/'prev')
- `get_game_state` - Request current game state
- `get_available_stocks` - Get list of available stocks

### Server → Client
- `game_update` - Real-time game state (15 Hz)
- `game_started` - Game initialized
- `game_over` - Game ended with final leaderboard
- `player_joined` - Player joined game
- `action_success` - Trade executed
- `action_failed` - Trade rejected
- `chart_navigated` - Chart navigation updated
- `error` - Error message

## Game Mechanics

- Initial cash: $10,000 (split between 2 funds)
- 2 stocks selected randomly from CSV files
- Tick rate: 15 Hz
- Actions: All-in (buy) / All-out (sell) per fund
- Leaderboard: Networth (cash + stock value)
