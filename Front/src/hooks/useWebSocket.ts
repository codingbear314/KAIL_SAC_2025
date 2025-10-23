import { useEffect, useState, useRef } from 'react';

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface UseWebSocketReturn {
  data: CandleData[];
  isConnected: boolean;
  error: string | null;
  currentPrice: number;
}

interface UseWebSocketProps {
  chartId: number;
  stockPrices: number[];
  isGameRunning: boolean;
  gameStartTime: number;
}

export const useWebSocket = ({ 
  chartId, 
  stockPrices, 
  isGameRunning,
  gameStartTime 
}: UseWebSocketProps): UseWebSocketReturn => {
  const [data, setData] = useState<CandleData[]>([]);
  const [isConnected] = useState(true);
  const [error] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const priceIndexRef = useRef(0);

  useEffect(() => {
    if (!isGameRunning || stockPrices.length === 0) {
      setData([]);
      setCurrentPrice(0);
      priceIndexRef.current = 0;
      return;
    }

    // Start from the beginning
    priceIndexRef.current = 0;
    
    // Initialize with first price
    const initialPrice = stockPrices[0];
    setCurrentPrice(initialPrice);
    
    const initialCandle: CandleData = {
      time: new Date().toISOString(),
      open: initialPrice,
      high: initialPrice,
      low: initialPrice,
      close: initialPrice,
      volume: 0,
    };
    setData([initialCandle]);
    
    // Update at 15Hz
    const interval = setInterval(() => {
      priceIndexRef.current += 1;
      
      if (priceIndexRef.current >= stockPrices.length) {
        // Loop back to start if we run out of data
        priceIndexRef.current = 0;
      }
      
      const newPrice = stockPrices[priceIndexRef.current];
      setCurrentPrice(newPrice);
      
      const newCandle: CandleData = {
        time: new Date().toISOString(),
        open: newPrice,
        high: newPrice,
        low: newPrice,
        close: newPrice,
        volume: 0,
      };
      
      setData((prevData) => [...prevData.slice(-49), newCandle]);
    }, 1000 / 15); // 15Hz

    return () => clearInterval(interval);
  }, [chartId, stockPrices, isGameRunning, gameStartTime]);

  /* WebSocket implementation - commented out for now
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/chart/${chartId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket connected for chart ${chartId}`);
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const newData: CandleData = JSON.parse(event.data);
        setData((prevData) => [...prevData.slice(-49), newData]);
      } catch (err) {
        console.error('Error parsing WebSocket data:', err);
        setError('Failed to parse data');
      }
    };

    ws.onerror = (event) => {
      console.error('WebSocket error:', event);
      setError('WebSocket connection error');
    };

    ws.onclose = () => {
      console.log(`WebSocket disconnected for chart ${chartId}`);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [chartId]);
  */

  return { data, isConnected, error, currentPrice };
};
