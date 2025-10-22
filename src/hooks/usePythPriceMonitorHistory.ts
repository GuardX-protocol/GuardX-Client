import { useContractRead, useNetwork } from 'wagmi';
import { useMemo, useState, useEffect } from 'react';
import { getContracts } from '@/config/contracts';
import { DEFAULT_CHAIN } from '@/config/chains';
import { PythPriceMonitorABI } from '@/config/abis';
import { getPythPriceFeedId } from '@/config/pythPriceFeeds';

interface PriceHistoryItem {
  price: number;
  timestamp: number;
  date: Date;
}

/**
 * Fetch price history from PythPriceMonitor contract
 * Uses deployment configuration to get the correct contract address
 */
export const usePythPriceMonitorHistory = (symbol: string, timeRange: number) => {
  const { chain } = useNetwork();
  const contracts = getContracts(chain?.id || DEFAULT_CHAIN.id);
  const [priceId, setPriceId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPriceId = async () => {
      const id = await getPythPriceFeedId(symbol);
      setPriceId(id);
    };
    fetchPriceId();
  }, [symbol]);

  // Fetch price history from PythPriceMonitor contract
  const { data, isLoading, isError, refetch } = useContractRead({
    address: contracts.PythPriceMonitor as `0x${string}`,
    abi: PythPriceMonitorABI,
    functionName: 'getPriceHistory',
    args: priceId ? [priceId as `0x${string}`, BigInt(timeRange)] : undefined,
    enabled: !!priceId && !!contracts.PythPriceMonitor,
    watch: false,
    cacheTime: 30000, // Cache for 30 seconds
  });

  const priceHistory = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    try {
      return (data as any[]).map((item) => {
        const price = Number(item.price || item[0] || 0) / 1e8; // Assuming 8 decimals
        const timestamp = Number(item.timestamp || item[1] || Date.now() / 1000);
        
        return {
          price,
          timestamp,
          date: new Date(timestamp * 1000),
        };
      }).filter(item => item.price > 0);
    } catch (error) {
      console.error('Error parsing price history:', error);
      return [];
    }
  }, [data]);

  const isEmpty = !isLoading && (!priceHistory || priceHistory.length === 0);

  return {
    priceHistory,
    isLoading,
    isError,
    refetch,
    isEmpty,
  };
};

/**
 * Fallback: Generate mock historical data based on current price
 * Used when PythPriceMonitor doesn't have historical data
 */
export const generateMockPriceHistory = (
  currentPrice: number, 
  timeRange: number, 
  symbol: string
): PriceHistoryItem[] => {
  const points = Math.min(timeRange / 3600, 24); // Max 24 points
  const now = Date.now();
  const interval = (timeRange * 1000) / points;
  
  // Generate deterministic but realistic price movements
  const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const volatility = 0.02; // 2% volatility
  
  return Array.from({ length: points }, (_, i) => {
    const timestamp = now - (points - i - 1) * interval;
    
    // Simple random walk with mean reversion
    const randomFactor = Math.sin(seed + i) * volatility;
    const meanReversion = (currentPrice - currentPrice * (1 + randomFactor)) * 0.1;
    const price = currentPrice * (1 + randomFactor - meanReversion);
    
    return {
      price: Math.max(price, currentPrice * 0.8), // Don't go below 80% of current price
      timestamp: Math.floor(timestamp / 1000),
      date: new Date(timestamp),
    };
  });
};