import eventlet
eventlet.monkey_patch()

from flask import Flask, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import random
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
available_stocks = []


def get_random_stocks():
    stocks = stock_loader.get_available_stocks()
    if len(stocks) < 2:
        raise ValueError("Need at least 2 stock CSV files")
    return random.sample(stocks, 2)


def game_loop():
    while game_state.game_running:
        try:
            price_a, action_a, networth_a = stock_loader.get_tick_data(
                game_state.stock_a_symbol,
                game_state.current_tick
            )
            price_b, action_b, networth_b = stock_loader.get_tick_data(
                game_state.stock_b_symbol,
                game_state.current_tick
            )

            # Update prices first
            game_state.update_prices(price_a, price_b, 0)

            # Execute AI actions from CSV
            ai_player = game_state.get_player('AI')
            if ai_player:
                # Execute action for fund A
                if action_a == 'buy':
                    ai_player.fund_a.all_in(price_a)
                elif action_a == 'sell':
                    ai_player.fund_a.all_out(price_a)
                
                # Execute action for fund B
                if action_b == 'buy':
                    ai_player.fund_b.all_in(price_b)
                elif action_b == 'sell':
                    ai_player.fund_b.all_out(price_b)
                
                # Calculate AI networth from actual holdings
                ai_networth = ai_player.get_total_networth(price_a, price_b)
                game_state.ai_networth = ai_networth

            state_update = game_state.get_state_dict()
            socketio.emit('game_update', state_update)

            # Stop after 3 minutes (2700 ticks at 15 Hz)
            if game_state.current_tick >= MAX_TICKS - 1:
                game_state.game_running = False
                socketio.emit('game_over', {
                    'final_state': state_update,
                    'leaderboard': game_state.get_leaderboard()
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
    game_state.add_player('AI')  # Add AI as a player
    game_state.add_player('Player 1')
    game_state.add_player('Player 2')

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
    stock_b = data.get('stock_b')

    if not stock_a or not stock_b:
        stocks = get_random_stocks()
        stock_a = stocks[0]
        stock_b = stocks[1]

    try:
        stock_loader.load_stock(stock_a)
        stock_loader.load_stock(stock_b)
        game_state.set_stocks(stock_a, stock_b)
        game_state.reset()
        game_state.game_running = True

        emit('game_started', {
            'stock_a': stock_a,
            'stock_b': stock_b,
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
    elif fund == 'b':
        if action == 'all_in':
            success = player.fund_b.all_in(game_state.current_price_b)
        elif action == 'all_out':
            success = player.fund_b.all_out(game_state.current_price_b)

    if success:
        emit('action_success', {
            'player_id': player_id,
            'fund': fund,
            'action': action,
            'player_state': player.to_dict(game_state.current_price_a, game_state.current_price_b)
        }, broadcast=True)
    else:
        emit('action_failed', {
            'message': f'Action {action} failed for fund {fund}'
        })


@socketio.on('navigate_chart')
def handle_navigate_chart(data):
    player_id = data.get('player_id', request.sid)
    fund = data.get('fund')
    direction = data.get('direction')

    player = game_state.get_player(player_id)
    if not player:
        emit('error', {'message': 'Player not found'})
        return

    if fund == 'a':
        if direction == 'next':
            player.current_chart_a += 1
        elif direction == 'prev':
            player.current_chart_a = max(0, player.current_chart_a - 1)
    elif fund == 'b':
        if direction == 'next':
            player.current_chart_b += 1
        elif direction == 'prev':
            player.current_chart_b = max(0, player.current_chart_b - 1)

    emit('chart_navigated', {
        'player_id': player_id,
        'fund': fund,
        'chart_index': player.current_chart_a if fund == 'a' else player.current_chart_b
    })


@socketio.on('get_available_stocks')
def handle_get_available_stocks():
    stocks = stock_loader.get_available_stocks()
    emit('available_stocks', {'stocks': stocks})


@socketio.on('get_game_state')
def handle_get_game_state():
    emit('game_state', game_state.get_state_dict())


if __name__ == '__main__':
    print("Starting KAIL SAC 2025 Game Server...")
    print(f"Tick rate: {TICK_RATE} Hz")
    socketio.run(app, host='0.0.0.0', port=5001, debug=False)
