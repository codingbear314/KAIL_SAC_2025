// List of available stock CSV files
export const STOCK_FILES = [
  'aaba.us.csv', 'afl.us.csv', 'an.us.csv', 'bc.us.csv', 'cce.us.csv',
  'cvx.us.csv', 'dgx.us.csv', 'dltr.us.csv', 'dlx.us.csv', 'ebay.us.csv',
  'f.us.csv', 'fitb.us.csv', 'gfi.us.csv', 'gild.us.csv', 'gpc.us.csv',
  'itw.us.csv', 'jnpr.us.csv', 'lb.us.csv', 'lpx.us.csv', 'lvlt.us.csv',
  'mco.us.csv', 'nyt.us.csv', 'pcg.us.csv', 'pfg.us.csv', 'pnc.us.csv',
  'slm.us.csv', 'sna.us.csv', 'ter.us.csv', 'teva.us.csv', 'vfc.us.csv',
  'vmc.us.csv', 'wen.us.csv', 'wy.us.csv', 'xel.us.csv', 'yum.us.csv',
  'zion.us.csv'
];

export interface StockPrice {
  price: number;
  index: number;
}

// Parse CSV and extract prices
export const parseCSV = async (filename: string): Promise<number[]> => {
  try {
    const response = await fetch(`/src/Stock_Data/${filename}`);
    const text = await response.text();
    const lines = text.trim().split('\n');
    
    // Skip header and extract first column (price)
    const prices: number[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const firstValue = line.split(',')[0];
        const price = parseFloat(firstValue);
        if (!isNaN(price)) {
          prices.push(price);
        }
      }
    }
    
    return prices;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
};

// Get two random stock files
export const getRandomStockFiles = (): [string, string] => {
  const shuffled = [...STOCK_FILES].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
};
