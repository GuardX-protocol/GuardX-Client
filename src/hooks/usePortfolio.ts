import { useContractRead, useAccount } from 'wagmi';
import { useCrashGuardCore } from './useContract';

export const usePortfolio = () => {
  const { address } = useAccount();
  const contract = useCrashGuardCore();

  const { data, isLoading, isError, refetch } = useContractRead({
    ...contract,
    functionName: 'getUserPortfolio' as any,
    args: address ? [address] : undefined,
    enabled: !!address,
    watch: false,
    cacheTime: 1000 * 60 * 5,
    onError: (error) => {
      // Suppress error if it's just empty data (no portfolio yet)
      if (error.message.includes('returned no data') || error.message.includes('0x')) {
        console.log('No portfolio data yet for user');
      } else {
        console.error('Error fetching portfolio:', error);
      }
    },
  });

  // Return empty portfolio structure if no data
  const emptyPortfolio = {
    assets: [],
    totalValue: BigInt(0),
    lastUpdated: BigInt(0),
    riskScore: BigInt(0),
  };

  return {
    portfolio: data || emptyPortfolio,
    isLoading,
    isError: false, // Don't show error for empty portfolios
    refetch,
  };
};
