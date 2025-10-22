import { useState, useEffect } from 'react';
import { pythSDK } from '@/services/pythSDK';

export const usePriceChange = (symbol: string) => {
  const [priceChange, setPriceChange] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPriceChange = async () => {
      try {
        const now = Date.now();
        const dayAgo = now - 24 * 3600 * 1000;
        
        const history = await pythSDK.getPriceHistory(symbol, dayAgo, now);
        
        if (history.length >= 2) {
          const oldPrice = history[0].price;
          const newPrice = history[history.length - 1].price;
          const change = ((newPrice - oldPrice) / oldPrice) * 100;
          setPriceChange(change);
        }
      } catch (error) {
        console.error(`Failed to fetch price change for ${symbol}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriceChange();
  }, [symbol]);

  return { priceChange, isLoading };
};