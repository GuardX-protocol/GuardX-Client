import { TokenInfo } from '@uniswap/token-lists';
import { useFastPrices, useFastPrice } from './useFastPrice';


export const usePythContractPrices = (tokens: TokenInfo[]) => {
  const symbols = tokens.map(t => t.symbol);
  const { prices, isLoading } = useFastPrices(symbols);
  
  const priceMap = new Map(
    Object.entries(prices).map(([symbol, price]) => [
      symbol.toUpperCase(),
      { price, formattedPrice: price.toFixed(2), confidence: price * 0.01, expo: -6, timestamp: Date.now(), publishTime: Date.now() }
    ])
  );
  
  return {
    priceMap,
    isLoading,
    isError: false,
    refetch: () => Promise.resolve(),
    getPrice: (symbol: string) => priceMap.get(symbol.toUpperCase()),
  };
};


export const usePythContractPrice = (symbol: string) => {
  const { price, isLoading } = useFastPrice(symbol);
  return {
    priceData: price ? { price, formattedPrice: price.toFixed(2), confidence: price * 0.01, expo: -6, timestamp: Date.now(), publishTime: Date.now() } : null,
    isLoading,
    isError: false,
    refetch: () => Promise.resolve(),
  };
};
