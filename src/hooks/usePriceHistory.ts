import { useReadContract, useChainId } from 'wagmi';
import { useMemo } from 'react';
import { getContracts } from '@/config/contracts';
import { DEFAULT_CHAIN } from '@/config/chains';
import { PythPriceMonitorABI } from '@/config/abis';

interface PriceData {
  price: bigint;
  timestamp: bigint;
  confidence: bigint;
  isValid: boolean;
}

export interface HistoricalPrice {
  price: number;
  formattedPrice: string;
  confidence: string;
  timestamp: number;
  date: Date;
  isValid: boolean;
}

export const usePriceHistory = (priceId: string, timeRange: number = 86400) => {
  const chainId = useChainId();
  const chainContracts = getContracts(chainId || DEFAULT_CHAIN.id);

  const { data, isLoading, isError, refetch } = useReadContract({
    address: chainContracts.PythPriceMonitor as `0x${string}`,
    abi: PythPriceMonitorABI,
    functionName: 'getPriceHistory',
    args: [priceId as `0x${string}`, BigInt(timeRange)],
    query: {
      enabled: !!priceId && timeRange > 0,
    },
  });

  const priceHistory = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    const history: HistoricalPrice[] = (data as PriceData[])
      .filter(item => item.isValid && Number(item.price) > 0)
      .map(item => {
        const actualPrice = Number(item.price) / 1e8;
        const timestamp = Number(item.timestamp);

        return {
          price: actualPrice,
          formattedPrice: actualPrice.toFixed(2),
          confidence: item.confidence.toString(),
          timestamp,
          date: new Date(timestamp * 1000),
          isValid: item.isValid,
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp ascending

    console.log(`✅ Fetched ${history.length} historical prices from PythPriceMonitor`);
    return history;
  }, [data]);

  return {
    priceHistory,
    isLoading,
    isError,
    refetch,
    isEmpty: priceHistory.length === 0,
  };
};

/**
 * Fetch price history by token address
 * First gets the price ID for the token, then fetches history
 * 
 * @param tokenAddress - Token contract address
 * @param timeRange - Time range in seconds
 */
export const usePriceHistoryByToken = (tokenAddress: string, timeRange: number = 86400) => {
  const chainId = useChainId();
  const chainContracts = getContracts(chainId || DEFAULT_CHAIN.id);

  // First, get the price ID for this token
  const { data: priceId } = useReadContract({
    address: chainContracts.PythPriceMonitor as `0x${string}`,
    abi: PythPriceMonitorABI,
    functionName: 'tokenToPriceId',
    args: [tokenAddress as `0x${string}`],
    query: {
      enabled: !!tokenAddress,
    },
  });

  // Then fetch the price history using the price ID
  const priceIdHex = priceId as string;
  const { priceHistory, isLoading, isError, refetch, isEmpty } = usePriceHistory(
    priceIdHex || '0x0000000000000000000000000000000000000000000000000000000000000000',
    timeRange
  );

  return {
    priceHistory,
    isLoading,
    isError,
    refetch,
    isEmpty,
    priceId: priceIdHex,
  };
};
