import { useState, useEffect, useCallback } from 'react';
import { coinMarketCapService, HistoricalPricePoint } from '@/services/coinMarketCapService';

interface UseCoinMarketCapHistoryReturn {
  historicalData: HistoricalPricePoint[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  isEmpty: boolean;
}

/**
 * Hook to fetch historical price data from CoinMarketCap API
 */
export const useCoinMarketCapHistory = (
  symbol: string,
  timeRange: '1H' | '24H' | '7D' | '30D'
): UseCoinMarketCapHistoryReturn => {
  const [historicalData, setHistoricalData] = useState<HistoricalPricePoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoricalData = useCallback(async () => {
    if (!symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await coinMarketCapService.getHistoricalData(symbol, timeRange);
      setHistoricalData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch historical data';
      setError(errorMessage);
      console.error('Error fetching CoinMarketCap historical data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeRange]);

  useEffect(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  const refetch = useCallback(() => {
    fetchHistoricalData();
  }, [fetchHistoricalData]);

  const isEmpty = !isLoading && historicalData.length === 0 && !error;

  return {
    historicalData,
    isLoading,
    error,
    refetch,
    isEmpty,
  };
};