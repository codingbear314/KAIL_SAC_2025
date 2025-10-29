# TODO: (Someday) "Update backend join_game to use custom player names from config" 


import eventlet
eventlet.monkey_patch()

from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import random
import json
import os
from datetime import datetime
from stock_data_loader import StockDataLoader
from game_state import GameState

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

game_state = GameState(initial_cash=10000.0)
stock_loader = StockDataLoader()

TICK_RATE = 15
TICK_INTERVAL = 1.0 / TICK_RATE
GAME_DURATION_SECONDS = 180  # 3 minutes
MAX_TICKS = TICK_RATE * GAME_DURATION_SECONDS  # 15 Hz * 180 sec = 2700 ticks

game_loop_task = None


# REST API endpoints for leaderboard
LEADERBOARD_FILE = 'global_leaderboard.json'

def save_game_results_to_global(leaderboard):
    """Automatically save game results to global leaderboard"""
    try:
        global_leaderboard = load_global_leaderboard()
        timestamp = datetime.now().isoformat()

        for entry in leaderboard:
            global_leaderboard.append({
                'player_id': entry['player_id'],
                'networth': entry['networth'],
                'timestamp': timestamp
            })

        # Sort by networth (descending) and keep only top 100
        global_leaderboard.sort(key=lambda x: x['networth'], reverse=True)
        global_leaderboard = global_leaderboard[:100]

        save_global_leaderboard(global_leaderboard)
        print(f"Saved {len(leaderboard)} results to global leaderboard")
        # Return the current top 10 for immediate use
        return global_leaderboard[:10]
    except Exception as e:
        print(f"Error saving to global leaderboard: {e}")
        return None

def load_global_leaderboard():
    if os.path.exists(LEADERBOARD_FILE):
        with open(LEADERBOARD_FILE, 'r') as f:
            return json.load(f)
    return []

def save_global_leaderboard(leaderboard):
    with open(LEADERBOARD_FILE, 'w') as f:
        json.dump(leaderboard, f, indent=2)


def get_random_stocks():
    stocks = stock_loader.get_available_stocks()
    if len(stocks) < 1:
        raise ValueError("Need at least 1 stock CSV file")
    return random.choice(stocks)


def game_loop():
    while game_state.game_running:
        try:
            price_a, action_a, _ = stock_loader.get_tick_data(
                game_state.stock_a_symbol,
                game_state.current_tick
            )

            game_state.update_prices(price_a)

            # Execute AI actions
            ai_player = game_state.get_player('AI')
            if ai_player:
                if action_a == 'Buy':
                    ai_player.fund_a.all_in(price_a)
                elif action_a == 'Sell':
                    ai_player.fund_a.all_out(price_a)

            state_update = game_state.get_state_dict()
            socketio.emit('game_update', state_update)

            # Stop after 3 minutes (2700 ticks at 15 Hz)
            if game_state.current_tick >= MAX_TICKS - 1:
                game_state.game_running = False
                print("Game ended!")
                # Get state AFTER setting game_running to False
                final_state = game_state.get_state_dict()
                leaderboard = game_state.get_leaderboard()
                
                # Save results to global leaderboard and get updated top-10
                updated_global_top10 = save_game_results_to_global(leaderboard)

                socketio.emit('game_over', {
                    'final_state': final_state,
                    'leaderboard': leaderboard,
                    'global_top10': updated_global_top10
                })

        except Exception as e:
            print(f"Error in game loop: {e}")
            game_state.game_running = False

        eventlet.sleep(TICK_INTERVAL)


@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')
    emit('connection_status', {'status': 'connected', 'client_id': request.sid})


@socketio.on('disconnect')
def handle_disconnect():
    print(f'Client disconnected: {request.sid}')
    game_state.remove_player(request.sid)


@socketio.on('join_game')
def handle_join_game(data):
    # Clear all existing players first (to handle renamed players)
    game_state.players.clear()
    
    # Add AI first
    game_state.add_player('AI')
    
    # Add players based on configuration
    player_names = data.get('playerNames', ['Player 1', 'Player 2', 'Player 3', 'Player 4'])
    num_players = data.get('numPlayers', 4)
    
    # Add the configured number of players
    for i in range(num_players):
        player_name = player_names[i] if i < len(player_names) else f'Player {i + 1}'
        game_state.add_player(player_name)
    
    print(f"Added {num_players} players: {player_names[:num_players]}")

    emit('player_joined', {
        'initial_state': game_state.get_state_dict()
    })


@socketio.on('start_game')
def handle_start_game(data):
    global game_loop_task

    if game_state.game_running:
        emit('error', {'message': 'Game already running'})
        return

    stock_a = data.get('stock_a')

    if not stock_a:
        stock_a = get_random_stocks()

    try:
        stock_loader.load_stock(stock_a)
        game_state.set_stocks(stock_a)
        game_state.reset()
        game_state.game_running = True

        print("Game started!")
        
        emit('game_started', {
            'stock_a': stock_a,
            'initial_state': game_state.get_state_dict()
        }, broadcast=True)

        game_loop_task = eventlet.spawn(game_loop)

    except Exception as e:
        emit('error', {'message': f'Failed to start game: {str(e)}'})


@socketio.on('player_action')
def handle_player_action(data):
    player_id = data.get('player_id')
    fund = data.get('fund')
    action = data.get('action')

    player = game_state.get_player(player_id)
    if not player:
        emit('error', {'message': 'Player not found'})
        return

    success = False
    if fund == 'a':
        if action == 'all_in':
            success = player.fund_a.all_in(game_state.current_price_a)
        elif action == 'all_out':
            success = player.fund_a.all_out(game_state.current_price_a)

    if success:
        emit('action_success', {
            'player_id': player_id,
            'fund': fund,
            'action': action,
            'player_state': player.to_dict(game_state.current_price_a)
        }, broadcast=True)
    else:
        emit('action_failed', {
            'message': f'Action {action} failed for fund {fund}'
        })


@socketio.on('get_available_stocks')
def handle_get_available_stocks():
    stocks = stock_loader.get_available_stocks()
    emit('available_stocks', {'stocks': stocks})


@socketio.on('get_game_state')
def handle_get_game_state():
    emit('game_state', game_state.get_state_dict())


# REST API endpoints for leaderboard
LEADERBOARD_FILE = 'global_leaderboard.json'

def save_game_results_to_global(leaderboard):
    """Automatically save game results to global leaderboard"""
    try:
        global_leaderboard = load_global_leaderboard()
        timestamp = datetime.now().isoformat()
        
        for entry in leaderboard:
            global_leaderboard.append({
                'player_id': entry['player_id'],
                'networth': entry['networth'],
                'timestamp': timestamp
            })
        
        # Sort by networth (descending) and keep only top 100
        global_leaderboard.sort(key=lambda x: x['networth'], reverse=True)
        global_leaderboard = global_leaderboard[:100]
        
        save_global_leaderboard(global_leaderboard)
        print(f"Saved {len(leaderboard)} results to global leaderboard")
    except Exception as e:
        print(f"Error saving to global leaderboard: {e}")

def load_global_leaderboard():
    """Load the global leaderboard from file"""
    if os.path.exists(LEADERBOARD_FILE):
        with open(LEADERBOARD_FILE, 'r') as f:
            return json.load(f)
    return []

def save_global_leaderboard(leaderboard):
    """Save the global leaderboard to file"""
    with open(LEADERBOARD_FILE, 'w') as f:
        json.dump(leaderboard, f, indent=2)

@app.route('/api/leaderboard/save', methods=['POST'])
def save_game_result():
    """Save game results to global leaderboard"""
    try:
        data = request.json
        player_results = data.get('results', [])
        
        # Load existing leaderboard
        global_leaderboard = load_global_leaderboard()
        
        # Add new results with timestamp
        timestamp = datetime.now().isoformat()
        for result in player_results:
            global_leaderboard.append({
                'player_id': result['player_id'],
                'networth': result['networth'],
                'timestamp': timestamp
            })
        
        # Sort by networth (descending) and keep only top 100
        global_leaderboard.sort(key=lambda x: x['networth'], reverse=True)
        global_leaderboard = global_leaderboard[:100]
        
        # Save back to file
        save_global_leaderboard(global_leaderboard)
        
        return jsonify({'success': True, 'message': 'Results saved'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/leaderboard/global', methods=['GET'])
def get_global_leaderboard():
    """Get the top 10 global leaderboard"""
    try:
        leaderboard = load_global_leaderboard()
        # Return top 10
        return jsonify(leaderboard[:10])
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("Starting KAIL SAC 2025 Game Server...")
    print(f"Tick rate: {TICK_RATE} Hz")
    socketio.run(app, host='0.0.0.0', port=5001, debug=False)
