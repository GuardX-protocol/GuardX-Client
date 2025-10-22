/**
 * Hook for fetching prices directly from Pyth Network
 */

import { useState, useEffect, useCallback } from 'react';
import { pythService } from '../services/pythService';
import { useFastPrices, useFastPrice } from './useFastPrice';



export const usePythPrices = (symbols: string[]) => {
  const { prices, isLoading, getPrice } = useFastPrices(symbols);
  
  const priceMap = new Map(
    Object.entries(prices).map(([symbol, price]) => [
      symbol.toUpperCase(),
      {
        price,
        formattedPrice: price.toFixed(price < 1 ? 6 : 2),
        confidence: price * 0.01,
        expo: -6,
        timestamp: Date.now(),
        publishTime: Date.now(),
      }
    ])
  );

  return {
    prices: priceMap,
    priceMap,
    isLoading,
    error: null,
    getPrice: (symbol: string) => {
      const price = getPrice(symbol);
      return price ? {
        symbol: symbol.toUpperCase(),
        price,
        formattedPrice: price.toFixed(price < 1 ? 6 : 2),
        confidence: price * 0.01,
        expo: -6,
        timestamp: Date.now(),
        publishTime: Date.now(),
      } : undefined;
    },
    refetch: () => Promise.resolve(),
  };
};

/**
 * Hook for fetching a single token price from Pyth
 */
export const usePythPrice = (symbol: string) => {
  const { price, isLoading } = useFastPrice(symbol);

  const formattedPrice = price ? {
    symbol: symbol.toUpperCase(),
    price,
    formattedPrice: price.toFixed(price < 1 ? 6 : 2),
    confidence: price * 0.01,
    expo: -6,
    timestamp: Date.now(),
    publishTime: Date.now(),
  } : null;

  return {
    price: formattedPrice,
    priceData: formattedPrice,
    isLoading,
    error: null,
    refetch: () => Promise.resolve(),
  };
};

/**
 * Hook for getting supported tokens from Pyth
 */
export const usePythSupportedTokens = () => {
  const [tokens, setTokens] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supportedTokens = await pythService.getSupportedTokens();
      setTokens(supportedTokens);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch supported tokens');
      console.error('Error fetching supported tokens:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  return {
    tokens,
    isLoading,
    error,
    refetch: fetchTokens,
  };
};

/**
 * Hook for getting tokens by category from Pyth
 */
export const usePythTokensByCategory = (category: 'stablecoins' | 'defi' | 'layer1' | 'layer2' | 'meme') => {
  const [tokens, setTokens] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const categoryTokens = await pythService.getTokensByCategory(category);
      setTokens(Array.isArray(categoryTokens) ? categoryTokens : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch category tokens');
      console.error(`Error fetching ${category} tokens:`, err);
      setTokens([]); // Ensure we always set an array
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  return {
    tokens,
    isLoading,
    error,
    refetch: fetchTokens,
  };
};