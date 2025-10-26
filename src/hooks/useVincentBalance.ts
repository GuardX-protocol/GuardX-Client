import { useState, useEffect, useCallback } from 'react';
import { useVincentAuth } from '@/components/auth/VincentAuth';
import { formatUnits } from 'viem';

interface BalanceResult {
  data: bigint | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Vincent Balance Service - fetches balances using Vincent's authenticated API
class VincentBalanceService {
  private jwt: string;

  constructor(jwt: string) {
    this.jwt = jwt;
  }

  async getETHBalance(chainId: number): Promise<bigint> {
    console.log(`Fetching Vincent ETH balance for chain ${chainId}`);
    
    try {
      // TODO: Replace with actual Vincent SDK call
      // For now, simulate the API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate a balance response
      // In production, this would call the Vincent API
      const mockBalance = BigInt(Math.floor(Math.random() * 1000000000000000000)); // Random ETH balance
      
      console.log(`Vincent ETH balance: ${formatUnits(mockBalance, 18)} ETH`);
      return mockBalance;
    } catch (error) {
      console.error('Failed to fetch Vincent ETH balance:', error);
      throw error;
    }
  }

  async getTokenBalance(chainId: number, tokenAddress: string): Promise<bigint> {
    console.log(`Fetching Vincent token balance for ${tokenAddress} on chain ${chainId}`);
    
    try {
      // TODO: Replace with actual Vincent SDK call
      // For now, simulate the API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate a balance response
      const mockBalance = BigInt(Math.floor(Math.random() * 1000000000000000000)); // Random token balance
      
      console.log(`Vincent token balance: ${mockBalance.toString()}`);
      return mockBalance;
    } catch (error) {
      console.error('Failed to fetch Vincent token balance:', error);
      throw error;
    }
  }
}

/**
 * Hook to fetch ETH balance for Vincent authenticated users
 */
export const useVincentETHBalance = (chainId?: number): BalanceResult => {
  const { jwt, isAuthenticated } = useVincentAuth();
  const [data, setData] = useState<bigint | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!isAuthenticated || !jwt || !chainId) {
      setData(undefined);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const service = new VincentBalanceService(jwt);
      const balance = await service.getETHBalance(chainId);
      setData(balance);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch ETH balance');
      setError(error);
      console.error('Error fetching Vincent ETH balance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [jwt, isAuthenticated, chainId]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchBalance,
  };
};

/**
 * Hook to fetch ERC20 token balance for Vincent authenticated users
 */
export const useVincentTokenBalance = (
  chainId?: number,
  tokenAddress?: string
): BalanceResult => {
  const { jwt, isAuthenticated } = useVincentAuth();
  const [data, setData] = useState<bigint | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!isAuthenticated || !jwt || !chainId || !tokenAddress) {
      setData(undefined);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const service = new VincentBalanceService(jwt);
      const balance = await service.getTokenBalance(chainId, tokenAddress);
      setData(balance);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch token balance');
      setError(error);
      console.error('Error fetching Vincent token balance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [jwt, isAuthenticated, chainId, tokenAddress]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchBalance,
  };
};
