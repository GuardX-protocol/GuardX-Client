import { useContractRead } from 'wagmi';
import { usePythPriceMonitor } from './useContract';

export const usePriceData = (tokenAddress: string) => {
  const contract = usePythPriceMonitor();

  const { data, isLoading, isError, refetch } = useContractRead({
    ...contract,
    functionName: 'getPrice' as any,
    args: tokenAddress ? [tokenAddress as `0x${string}`] : undefined,
    enabled: !!tokenAddress,
    watch: true,
  });

  const formatPrice = () => {
    if (!data) return null;
    const [price, conf, expo] = data as unknown as [bigint, bigint, number];
    const formattedPrice = Number(price) * Math.pow(10, expo);
    return {
      price: formattedPrice,
      confidence: Number(conf),
      expo,
    };
  };

  return {
    priceData: data,
    formattedPrice: formatPrice(),
    isLoading,
    isError,
    refetch,
  };
};
