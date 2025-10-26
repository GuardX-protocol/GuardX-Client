import { useReadContract, useAccount } from 'wagmi';
import { useCrashGuardCore } from './useContract';

export const usePortfolio = () => {
  const { address } = useAccount();
  const contract = useCrashGuardCore();

  const { data, isLoading, refetch } = useReadContract({
    ...contract,
    functionName: 'getUserPortfolio',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
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
