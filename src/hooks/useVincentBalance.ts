import { useState, useEffect, useCallback } from 'react';
import { useVincentAuth } from '@/components/auth/VincentAuth';
import { formatUnits } from 'viem';
import { ethers } from 'ethers';

interface BalanceData {
  value: bigint;
  decimals: number;
  symbol: string;
  formatted: string;
}

// RPC URLs for different chains
const RPC_URLS: Record<number, string> = {
  421614: 'https://sepolia-rollup.arbitrum.io/rpc', // Arbitrum Sepolia
  84532: 'https://sepolia.base.org', // Base Sepolia
  11155111: 'https://ethereum-sepolia.publicnode.com', // Ethereum Sepolia
};

// ERC20 ABI for balance checking
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

// Get native token symbol for each chain
const getChainNativeSymbol = (chainId: number): string => {
  switch (chainId) {
    case 421614: // Arbitrum Sepolia
    case 42161:  // Arbitrum One
      return 'ETH';
    case 84532:  // Base Sepolia
    case 8453:   // Base
      return 'ETH';
    case 11155111: // Ethereum Sepolia
    case 1:        // Ethereum Mainnet
      return 'ETH';
    default:
      return 'ETH';
  }
};

export const useVincentBalance = (chainId?: number, tokenAddress?: string) => {
  const { isAuthenticated, user } = useVincentAuth();
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!isAuthenticated || !user?.pkpAddress || !chainId) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const rpcUrl = RPC_URLS[chainId];
      if (!rpcUrl) {
        throw new Error(`No RPC URL configured for chain ${chainId}`);
      }

      console.log(`Fetching real balance for PKP ${user.pkpAddress} on chain ${chainId}`);
      
      // Create ethers provider
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const isNativeToken = !tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000';
      
      if (isNativeToken) {
        // Fetch native token (ETH) balance
        const balance = await provider.getBalance(user.pkpAddress);
        
        setBalance({
          value: balance,
          decimals: 18,
          symbol: getChainNativeSymbol(chainId),
          formatted: formatUnits(balance, 18),
        });
      } else {
        // Fetch ERC20 token balance
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        
        const [balance, decimals, symbol] = await Promise.all([
          tokenContract.balanceOf(user.pkpAddress),
          tokenContract.decimals(),
          tokenContract.symbol(),
        ]);
        
        setBalance({
          value: balance,
          decimals: Number(decimals),
          symbol: symbol,
          formatted: formatUnits(balance, Number(decimals)),
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch Vincent balance:', err);
      setError(err.message);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.pkpAddress, chainId, tokenAddress]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const refetch = useCallback(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    data: balance,
    isLoading,
    error,
    refetch,
  };
};

// Hook to get ETH balance for Vincent PKP
export const useVincentETHBalance = (chainId?: number) => {
  return useVincentBalance(chainId);
};

// Hook to get ERC20 token balance for Vincent PKP
export const useVincentTokenBalance = (chainId?: number, tokenAddress?: string) => {
  return useVincentBalance(chainId, tokenAddress);
};