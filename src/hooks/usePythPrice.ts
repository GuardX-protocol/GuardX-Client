import { useEffect, useState } from 'react';
import { useContractRead } from 'wagmi';
import { EXTERNAL_CONTRACTS } from '@/config/contracts';

// Pyth Network ABI for price feeds
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
  {
    inputs: [{ name: 'id', type: 'bytes32' }],
    name: 'getPrice',
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

interface PythPrice {
  price: number;
  confidence: number;
  expo: number;
  publishTime: number;
  formattedPrice: string;
}

export const usePythPrice = (priceId?: string) => {
  const [priceData, setPriceData] = useState<PythPrice | null>(null);

  const { data, isLoading, isError, refetch } = useContractRead({
    address: EXTERNAL_CONTRACTS.PythContract as `0x${string}`,
    abi: PYTH_ABI,
    functionName: 'getPriceUnsafe',
    args: priceId ? [priceId as `0x${string}`] : undefined,
    enabled: !!priceId,
    watch: false, // Disable auto-watching
    cacheTime: 1000 * 10, // Cache for 10 seconds
  });

  useEffect(() => {
    if (data) {
      try {
        // Pyth returns a tuple/struct with price data
        const priceStruct = data as any;
        
        // Extract values from the struct
        const price = BigInt(priceStruct.price || priceStruct[0] || 0);
        const conf = BigInt(priceStruct.conf || priceStruct[1] || 0);
        const expo = Number(priceStruct.expo || priceStruct[2] || 0);
        const publishTime = BigInt(priceStruct.publishTime || priceStruct[3] || 0);
        
        // Convert price to human-readable format
        // Pyth prices are in the format: price * 10^expo
        const priceValue = Number(price);
        const expoValue = expo;
        const actualPrice = priceValue * Math.pow(10, expoValue);
        const formattedPrice = Math.abs(actualPrice).toFixed(2);

        setPriceData({
          price: priceValue,
          confidence: Number(conf),
          expo: expoValue,
          publishTime: Number(publishTime),
          formattedPrice,
        });
      } catch (error) {
        console.error('Error parsing Pyth price data:', error, data);
        setPriceData(null);
      }
    }
  }, [data]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!priceId) return;
    
    const interval = setInterval(() => {
      refetch();
    }, 10000);

    return () => clearInterval(interval);
  }, [priceId, refetch]);

  return {
    priceData,
    isLoading,
    isError,
    refetch,
  };
};

// Hook for multiple price feeds
export const useMultiplePythPrices = (priceIds: string[]) => {
  const prices = priceIds.map(id => usePythPrice(id));
  
  return {
    prices: prices.map(p => p.priceData),
    isLoading: prices.some(p => p.isLoading),
    isError: prices.some(p => p.isError),
    refetch: () => prices.forEach(p => p.refetch()),
  };
};
