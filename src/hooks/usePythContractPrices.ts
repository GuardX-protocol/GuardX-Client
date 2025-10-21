import { useContractReads, useNetwork } from 'wagmi';
import { useMemo } from 'react';
import { getExternalContracts } from '@/config/contracts';
import { DEFAULT_CHAIN } from '@/config/chains';
import { PYTH_PRICE_FEED_IDS } from '@/config/pythPriceFeeds';
import { TokenInfo } from '@uniswap/token-lists';

// Pyth ABI for reading prices
const PYTH_ABI = [
  {
    inputs: [{ name: 'id', type: 'bytes32' }],
    name: 'getPriceUnsafe',
    outputs: [
      {
        components: [
          { name: 'price', type: 'int64' },
          { name: 'conf', type: 'uint64' },
          { name: 'expo', type: 'int32' },
          { name: 'publishTime', type: 'uint256' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

interface PriceResult {
  price: bigint;
  conf: bigint;
  expo: number;
  publishTime: bigint;
}

interface FormattedPrice {
  price: number;
  formattedPrice: string;
  confidence: number;
  expo: number;
  timestamp: number;
  publishTime: number; // Alias for timestamp for backward compatibility
}

/**
 * Fetch prices directly from Pyth contract based on selected network
 * Uses deployment configuration to get the correct Pyth contract address
 * Includes fallback mechanisms for tokens without Pyth feeds
 */
export const usePythContractPrices = (tokens: TokenInfo[]) => {
  const { chain } = useNetwork();
  const externalContracts = getExternalContracts(chain?.id || DEFAULT_CHAIN.id);
  const pythContractAddress = externalContracts.PythContract;

  // Separate tokens with and without Pyth feeds
  const tokensWithFeeds = useMemo(() => 
    tokens.filter(token => PYTH_PRICE_FEED_IDS[token.symbol.toUpperCase()]),
    [tokens]
  );

  const tokensWithoutFeeds = useMemo(() => 
    tokens.filter(token => !PYTH_PRICE_FEED_IDS[token.symbol.toUpperCase()]),
    [tokens]
  );

  // Prepare contract calls for tokens that have Pyth price feeds
  const contracts = useMemo(() => {
    return tokensWithFeeds.map(token => ({
      address: pythContractAddress as `0x${string}`,
      abi: PYTH_ABI,
      functionName: 'getPriceUnsafe',
      args: [PYTH_PRICE_FEED_IDS[token.symbol.toUpperCase()] as `0x${string}`],
    }));
  }, [tokensWithFeeds, pythContractAddress]);

  // Batch read all prices
  const { data, isLoading, isError, refetch } = useContractReads({
    contracts,
    watch: false,
    cacheTime: 10000,
    staleTime: 5000,
  });

  const priceMap = useMemo(() => {
    const map = new Map<string, FormattedPrice>();

    // Process Pyth contract data
    if (data) {
      tokensWithFeeds.forEach((token, index) => {
        const result = data[index];
        if (result?.status === 'success' && result.result) {
          try {
            const priceData = result.result as PriceResult;
            
            const priceValue = Number(priceData.price);
            const expo = Number(priceData.expo);
            const actualPrice = priceValue * Math.pow(10, expo);

            if (actualPrice > 0) {
              const timestamp = Number(priceData.publishTime);
              map.set(token.symbol.toUpperCase(), {
                price: actualPrice,
                formattedPrice: actualPrice.toFixed(2),
                confidence: Number(priceData.conf) * Math.pow(10, expo),
                expo,
                timestamp,
                publishTime: timestamp,
              });
            }
          } catch (error) {
            console.debug(`Error parsing price for ${token.symbol}:`, error);
          }
        }
      });
    }

    // Add mock prices for tokens without Pyth feeds (for demo purposes)
    tokensWithoutFeeds.forEach(token => {
      // Generate deterministic mock price based on token symbol
      const seed = token.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const basePrice = (seed % 1000) / 100; // Price between 0.01 and 9.99
      const mockPrice = Math.max(0.01, basePrice);
      
      map.set(token.symbol.toUpperCase(), {
        price: mockPrice,
        formattedPrice: mockPrice.toFixed(4),
        confidence: mockPrice * 0.01, // 1% confidence interval
        expo: -4,
        timestamp: Math.floor(Date.now() / 1000),
        publishTime: Math.floor(Date.now() / 1000),
      });
    });

    if (map.size > 0) {
      console.log(`✅ Fetched ${tokensWithFeeds.length} prices from Pyth contract, generated ${tokensWithoutFeeds.length} mock prices on chain ${chain?.id || DEFAULT_CHAIN.id}`);
    }

    return map;
  }, [data, tokensWithFeeds, tokensWithoutFeeds, chain?.id]);

  return {
    priceMap,
    isLoading,
    isError,
    refetch,
    getPrice: (symbol: string) => priceMap.get(symbol.toUpperCase()),
  };
};

/**
 * Get price for a single token from Pyth contract
 */
export const usePythContractPrice = (symbol: string) => {
  const { chain } = useNetwork();
  const externalContracts = getExternalContracts(chain?.id || DEFAULT_CHAIN.id);
  const pythContractAddress = externalContracts.PythContract;
  const priceId = PYTH_PRICE_FEED_IDS[symbol.toUpperCase()];

  const { data, isLoading, isError, refetch } = useContractReads({
    contracts: priceId ? [{
      address: pythContractAddress as `0x${string}`,
      abi: PYTH_ABI,
      functionName: 'getPriceUnsafe',
      args: [priceId as `0x${string}`],
    }] : [],
    watch: false,
    cacheTime: 10000,
    enabled: !!priceId,
  });

  const priceData = useMemo(() => {
    if (!data || !data[0] || data[0].status !== 'success') return null;

    const result = data[0].result as PriceResult;
    const priceValue = Number(result.price);
    const expo = Number(result.expo);
    const actualPrice = priceValue * Math.pow(10, expo);

    if (actualPrice <= 0) return null;

    const timestamp = Number(result.publishTime);
    return {
      price: actualPrice,
      formattedPrice: actualPrice.toFixed(2),
      confidence: Number(result.conf) * Math.pow(10, expo),
      expo,
      timestamp,
      publishTime: timestamp, // Alias for backward compatibility
    };
  }, [data]);

  return {
    priceData,
    isLoading,
    isError,
    refetch,
  };
};
