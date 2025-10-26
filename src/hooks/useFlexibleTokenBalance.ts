import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { formatUnits } from 'viem';

// RPC URLs for different chains
const RPC_URLS: Record<number, string> = {
  421614: 'https://sepolia-rollup.arbitrum.io/rpc', // Arbitrum Sepolia
  84532: 'https://sepolia.base.org', // Base Sepolia
  11155111: 'https://ethereum-sepolia.publicnode.com', // Ethereum Sepolia
  1: 'https://eth-mainnet.public.blastapi.io', // Ethereum Mainnet
  137: 'https://polygon-rpc.com', // Polygon
  42161: 'https://arb1.arbitrum.io/rpc', // Arbitrum One
  8453: 'https://mainnet.base.org', // Base Mainnet
};

// ERC20 ABI for balance checking
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

export interface FlexibleTokenBalance {
  address: string;
  walletAddress: string;
  chainId: number;
  nativeBalance: string; // ETH in wei
  formattedNative: string; // Human-readable ETH
  tokenBalance?: string; // ERC20 in smallest unit
  formattedToken?: string; // Human-readable ERC20
  tokenSymbol?: string;
  tokenName?: string;
  tokenDecimals?: number;
  isNativeToken: boolean;
}

export const useFlexibleTokenBalance = (chainId: number, tokenAddress?: string, walletAddress?: string) => {
  const [balance, setBalance] = useState<FlexibleTokenBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!walletAddress) {
      setError('No wallet address provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rpcUrl = RPC_URLS[chainId];
      if (!rpcUrl) {
        throw new Error(`No RPC URL configured for chain ${chainId}`);
      }

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const isNativeToken = !tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000';

      console.log(`Fetching balance for ${walletAddress} on chain ${chainId}`, {
        tokenAddress,
        isNativeToken,
      });

      // Always fetch native ETH balance
      const nativeWei = await provider.getBalance(walletAddress);
      const formattedNative = ethers.formatEther(nativeWei);

      const result: FlexibleTokenBalance = {
        address: tokenAddress || '0x0000000000000000000000000000000000000000',
        walletAddress,
        chainId,
        nativeBalance: nativeWei.toString(),
        formattedNative,
        isNativeToken,
      };

      // Fetch ERC20 token balance if tokenAddress is provided
      if (!isNativeToken && tokenAddress) {
        try {
          const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          
          const [tokenWei, decimals, symbol, name] = await Promise.all([
            tokenContract.balanceOf(walletAddress),
            tokenContract.decimals(),
            tokenContract.symbol(),
            tokenContract.name(),
          ]);

          result.tokenBalance = tokenWei.toString();
          result.tokenDecimals = Number(decimals);
          result.tokenSymbol = symbol;
          result.tokenName = name;
          result.formattedToken = formatUnits(tokenWei, Number(decimals));
        } catch (tokenError: any) {
          console.warn('Failed to fetch token details:', tokenError);
          // Still return native balance even if token fetch fails
          result.tokenBalance = '0';
          result.formattedToken = '0';
          result.tokenSymbol = 'UNKNOWN';
          result.tokenName = 'Unknown Token';
          result.tokenDecimals = 18;
        }
      }

      setBalance(result);
    } catch (err: any) {
      console.error('Failed to fetch wallet balance:', err);
      setError(err.message || 'Failed to fetch balance');
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [walletAddress, chainId, tokenAddress]);

  useEffect(() => {
    if (walletAddress) {
      fetchBalance();
    }
  }, [fetchBalance, walletAddress]);

  const refetch = useCallback(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { 
    balance, 
    loading, 
    error, 
    refetch,
    // Helper functions
    hasNativeBalance: balance ? parseFloat(balance.formattedNative) > 0 : false,
    hasTokenBalance: balance ? parseFloat(balance.formattedToken || '0') > 0 : false,
    getDisplayBalance: () => {
      if (!balance) return '0.00';
      if (balance.isNativeToken) {
        return parseFloat(balance.formattedNative).toFixed(4);
      }
      return parseFloat(balance.formattedToken || '0').toFixed(4);
    },
    getDisplaySymbol: () => {
      if (!balance) return 'ETH';
      if (balance.isNativeToken) {
        return 'ETH';
      }
      return balance.tokenSymbol || 'TOKEN';
    }
  };
};