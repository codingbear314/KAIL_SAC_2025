from typing import Dict, List
from dataclasses import dataclass, field


@dataclass
class Fund:
    cash: float
    shares: float = 0.0

    def get_value(self, current_price: float) -> float:
        return self.cash + (self.shares * current_price)

    def all_in(self, price: float) -> bool:
        if self.cash <= 0:
            return False
        self.shares += self.cash / price
        self.cash = 0.0
        return True

    def all_out(self, price: float) -> bool:
        if self.shares <= 0:
            return False
        self.cash += self.shares * price
        self.shares = 0.0
        return True


@dataclass
class Player:
    player_id: str
    fund_a: Fund
    fund_b: Fund

    def get_total_networth(self, price_a: float, price_b: float) -> float:
        return self.fund_a.get_value(price_a) + self.fund_b.get_value(price_b)

    def to_dict(self, price_a: float, price_b: float) -> dict:
        return {
            'player_id': self.player_id,
            'fund_a': {
                'cash': self.fund_a.cash,
                'shares': self.fund_a.shares,
                'value': self.fund_a.get_value(price_a)
            },
            'fund_b': {
                'cash': self.fund_b.cash,
                'shares': self.fund_b.shares,
                'value': self.fund_b.get_value(price_b)
            },
            'networth': self.get_total_networth(price_a, price_b)
        }


class GameState:
    def __init__(self, initial_cash: float = 10000.0):
        self.initial_cash = initial_cash
        self.players: Dict[str, Player] = {}
        self.stock_a_symbol: str = ""
        self.stock_b_symbol: str = ""
        self.current_tick: int = 0
        self.current_price_a: float = 0.0
        self.current_price_b: float = 0.0
        self.game_running: bool = False

    def add_player(self, player_id: str) -> Player:
        fund_a = Fund(cash=self.initial_cash / 2)
        fund_b = Fund(cash=self.initial_cash / 2)
        player = Player(player_id=player_id, fund_a=fund_a, fund_b=fund_b)
        self.players[player_id] = player
        return player

    def remove_player(self, player_id: str):
        if player_id in self.players:
            del self.players[player_id]

    def get_player(self, player_id: str) -> Player:
        return self.players.get(player_id)

    def set_stocks(self, stock_a: str, stock_b: str):
        self.stock_a_symbol = stock_a
        self.stock_b_symbol = stock_b

    def update_prices(self, price_a: float, price_b: float):
        self.current_price_a = price_a
        self.current_price_b = price_b
        self.current_tick += 1

    def get_leaderboard(self) -> List[dict]:
        leaderboard = []

        for player_id, player in self.players.items():
            player_type = 'ai' if player_id == 'AI' else 'human'
            leaderboard.append({
                'player_id': player_id,
                'networth': player.get_total_networth(self.current_price_a, self.current_price_b),
                'type': player_type
            })

        leaderboard.sort(key=lambda x: x['networth'], reverse=True)
        return leaderboard

    def get_state_dict(self) -> dict:
        return {
            'current_tick': self.current_tick,
            'stock_a': {
                'symbol': self.stock_a_symbol,
                'price': self.current_price_a
            },
            'stock_b': {
                'symbol': self.stock_b_symbol,
                'price': self.current_price_b
            },
            'players': {
                pid: player.to_dict(self.current_price_a, self.current_price_b)
                for pid, player in self.players.items()
            },
            'leaderboard': self.get_leaderboard(),
            'game_running': self.game_running
        }

    def reset(self):
        self.current_tick = 0
        self.current_price_a = 0.0
        self.current_price_b = 0.0
        self.game_running = False

        for player in self.players.values():
            player.fund_a = Fund(cash=self.initial_cash / 2)
            player.fund_b = Fund(cash=self.initial_cash / 2)
