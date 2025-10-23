import pandas as pd
import os
from typing import Dict, List, Tuple


class StockDataLoader:
    def __init__(self, stock_data_path: str = "../Front/src/Stock_Data"):
        self.stock_data_path = stock_data_path
        self.loaded_stocks: Dict[str, pd.DataFrame] = {}

    def load_stock(self, stock_symbol: str) -> pd.DataFrame:
        file_path = os.path.join(self.stock_data_path, f"{stock_symbol}.csv")

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Stock data file not found: {file_path}")

        df = pd.read_csv(file_path)

        required_columns = ['price', 'action', 'networth']
        for col in required_columns:
            if col not in df.columns:
                raise ValueError(f"Missing required column '{col}' in {stock_symbol}")

        self.loaded_stocks[stock_symbol] = df
        return df

    def get_stock_data(self, stock_symbol: str) -> pd.DataFrame:
        if stock_symbol not in self.loaded_stocks:
            return self.load_stock(stock_symbol)
        return self.loaded_stocks[stock_symbol]

    def get_available_stocks(self) -> List[str]:
        stocks = []
        for file in os.listdir(self.stock_data_path):
            if file.endswith('.csv'):
                stocks.append(file.replace('.csv', ''))
        return sorted(stocks)

    def get_tick_data(self, stock_symbol: str, tick_index: int) -> Tuple[float, str, float]:
        df = self.get_stock_data(stock_symbol)

        if tick_index >= len(df):
            tick_index = len(df) - 1

        row = df.iloc[tick_index]
        return (float(row['price']), str(row['action']), float(row['networth']))

    def get_stock_length(self, stock_symbol: str) -> int:
        df = self.get_stock_data(stock_symbol)
        return len(df)
