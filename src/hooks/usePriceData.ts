import { useFastPrice } from './useFastPrice';

export const usePriceData = (symbol: string) => {
  const { price, isLoading } = useFastPrice(symbol);

  return {
    priceData: price ? { price, confidence: price * 0.01, expo: -6 } : null,
    formattedPrice: price ? { price, confidence: price * 0.01, expo: -6 } : null,
    isLoading,
    isError: false,
    refetch: () => Promise.resolve(),
  };
};
