import { useContractReads, useNetwork } from 'wagmi';
import { useMemo } from 'react';
import { getContracts } from '@/config/contracts';
import { DEFAULT_CHAIN } from '@/config/chains';
import { PythPriceMonitorABI } from '@/config/abis';
import { TokenInfo } from '@uniswap/token-lists';

interface PriceData {
  price: bigint;
  timestamp: bigint;
  confidence: bigint;
  isValid: boolean;
}

interface FormattedPrice {
  price: number;
  formattedPrice: string;
  confidence: string;
  timestamp: number;
  isValid: boolean;
}

/**
 * Fetch live prices from PythPriceMonitor contract using getPriceByToken
 * No hardcoded values - fetches directly from blockchain
 * Time Complexity: O(1) - Single batch contract call
 * Space Complexity: O(n) where n is number of tokens
 */
export const useLivePrices = (tokens: TokenInfo[]) => {
  const { chain } = useNetwork();
  const chainContracts = getContracts(chain?.id || DEFAULT_CHAIN.id);
  
  // Prepare contract calls for all token addresses
  const contracts = useMemo(() => {
    return tokens.map(token => ({
      address: chainContracts.PythPriceMonitor as `0x${string}`,
      abi: PythPriceMonitorABI,
      functionName: 'getPriceByToken',
      args: [token.address as `0x${string}`],
    }));
  }, [tokens, chainContracts]);

  // Batch read all prices in a single call
  const { data, isLoading, isError, refetch } = useContractReads({
    contracts,
    watch: false,
    cacheTime: 10000, // Cache for 10 seconds
  });

  // Process results into a map for O(1) lookup
  const priceMap = useMemo(() => {
    const map = new Map<string, FormattedPrice>();
    
    if (!data) return map;

    tokens.forEach((token, index) => {
      const result = data[index];
      if (result?.status === 'success' && result.result) {
        const priceData = result.result as PriceData;
        
        // Only add if price is valid
        if (priceData.isValid && Number(priceData.price) > 0) {
          // Price is stored with 8 decimals in Pyth
          const actualPrice = Number(priceData.price) / 1e8;
          
          map.set(token.symbol.toUpperCase(), {
            price: actualPrice,
            formattedPrice: actualPrice.toFixed(2),
            confidence: priceData.confidence.toString(),
            timestamp: Number(priceData.timestamp),
            isValid: priceData.isValid,
          });
        }
      }
    });

    console.log(`✅ Fetched ${map.size} live prices from PythPriceMonitor contract`);
    return map;
  }, [data, tokens]);

  return {
    priceMap,
    isLoading,
    isError,
    refetch,
    getPrice: (symbol: string) => priceMap.get(symbol.toUpperCase()),
  };
};

/**
 * Get price for a single token
 */
export const useLivePrice = (tokenAddress: string) => {
  const { chain } = useNetwork();
  const chainContracts = getContracts(chain?.id || DEFAULT_CHAIN.id);
  
  const { data, isLoading, isError, refetch } = useContractReads({
    contracts: [{
      address: chainContracts.PythPriceMonitor as `0x${string}`,
      abi: PythPriceMonitorABI,
      functionName: 'getPriceByToken',
      args: [tokenAddress as `0x${string}`],
    }],
    watch: false,
    cacheTime: 10000,
  });

  const priceData = useMemo(() => {
    if (!data || !data[0] || data[0].status !== 'success') return null;
    
    const result = data[0].result as PriceData;
    if (!result.isValid || Number(result.price) === 0) return null;

    const actualPrice = Number(result.price) / 1e8;
    
    return {
      price: actualPrice,
      formattedPrice: actualPrice.toFixed(2),
      confidence: result.confidence.toString(),
      timestamp: Number(result.timestamp),
      isValid: result.isValid,
    };
  }, [data]);

  return {
    priceData,
    isLoading,
    isError,
    refetch,
  };
};
