from stock_data_loader import StockDataLoader

def test_stock_loader():
    loader = StockDataLoader()

    print("Available stocks:")
    stocks = loader.get_available_stocks()
    print(f"Found {len(stocks)} stocks")
    print(stocks[:10])

    if stocks:
        test_stock = stocks[0]
        print(f"\nTesting with: {test_stock}")

        df = loader.load_stock(test_stock)
        print(f"Loaded {len(df)} rows")
        print(f"Columns: {df.columns.tolist()}")
        print(f"\nFirst 5 rows:")
        print(df.head())

        price, action, networth = loader.get_tick_data(test_stock, 0)
        print(f"\nTick 0: Price={price}, Action={action}, Networth={networth}")

if __name__ == "__main__":
    test_stock_loader()
