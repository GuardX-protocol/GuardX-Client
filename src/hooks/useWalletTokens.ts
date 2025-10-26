import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useVincentAuth } from '@/components/auth/VincentAuth';
import { formatUnits } from 'viem';
import { ARBITRUM_SEPOLIA_TOKENS, BASE_SEPOLIA_TOKENS } from '@/config/testnetTokens';

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

export interface WalletToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  balance: string; // Raw balance in smallest unit
  formattedBalance: string; // Human-readable balance
  isNative: boolean;
  usdValue?: number;
}

export const useWalletTokens = (chainId: number) => {
  const { user, isAuthenticated } = useVincentAuth();
  const [tokens, setTokens] = useState<WalletToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTokenList = useCallback((chainId: number) => {
    switch (chainId) {
      case 421614: // Arbitrum Sepolia
        return ARBITRUM_SEPOLIA_TOKENS;
      case 84532: // Base Sepolia
        return BASE_SEPOLIA_TOKENS;
      default:
        return [];
    }
  }, []);

  const fetchTokenBalance = async (
    provider: ethers.JsonRpcProvider,
    walletAddress: string,
    tokenAddress: string,
    tokenInfo: any
  ): Promise<WalletToken | null> => {
    try {
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        // Native ETH
        const balance = await provider.getBalance(walletAddress);
        const formattedBalance = ethers.formatEther(balance);
        
        return {
          address: tokenAddress,
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18,
          logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
          chainId,
          balance: balance.toString(),
          formattedBalance,
          isNative: true,
        };
      } else {
        // ERC20 Token - with better error handling
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        
        try {
          // Try to fetch token info with individual calls and fallbacks
          let balance, decimals, symbol, name;
          
          // Always try to get balance first
          try {
            balance = await tokenContract.balanceOf(walletAddress);
          } catch (balanceError) {
            console.warn(`Failed to get balance for ${tokenAddress}:`, balanceError);
            return null; // If we can't get balance, skip this token
          }

          // Try to get decimals with fallback
          try {
            decimals = await tokenContract.decimals();
          } catch (decimalsError) {
            console.warn(`Failed to get decimals for ${tokenAddress}, using fallback:`, decimalsError);
            decimals = tokenInfo.decimals || 18; // Use fallback from config
          }

          // Try to get symbol with fallback
          try {
            symbol = await tokenContract.symbol();
          } catch (symbolError) {
            console.warn(`Failed to get symbol for ${tokenAddress}, using fallback:`, symbolError);
            symbol = tokenInfo.symbol || 'UNKNOWN';
          }

          // Try to get name with fallback
          try {
            name = await tokenContract.name();
          } catch (nameError) {
            console.warn(`Failed to get name for ${tokenAddress}, using fallback:`, nameError);
            name = tokenInfo.name || 'Unknown Token';
          }

          const formattedBalance = formatUnits(balance, Number(decimals));

          return {
            address: tokenAddress,
            symbol: symbol || tokenInfo.symbol,
            name: name || tokenInfo.name,
            decimals: Number(decimals),
            logoURI: tokenInfo.logoURI,
            chainId,
            balance: balance.toString(),
            formattedBalance,
            isNative: false,
          };
        } catch (contractError) {
          console.warn(`Contract interaction failed for ${tokenAddress}:`, contractError);
          return null;
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch balance for token ${tokenAddress}:`, error);
      return null;
    }
  };

  const fetchAllTokens = useCallback(async () => {
    if (!isAuthenticated || !user?.pkpAddress) {
      setError('Vincent wallet not connected');
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
      const walletAddress = user.pkpAddress;
      const tokenList = getTokenList(chainId);

      console.log(`Fetching all tokens for ${walletAddress} on chain ${chainId}`);

      // Fetch balances for all tokens in parallel
      const tokenPromises = tokenList.map(token =>
        fetchTokenBalance(provider, walletAddress, token.address, token)
      );

      const tokenResults = await Promise.allSettled(tokenPromises);
      
      const validTokens: WalletToken[] = [];
      
      tokenResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const token = result.value;
          // Only include tokens with non-zero balance
          if (parseFloat(token.formattedBalance) > 0) {
            validTokens.push(token);
          }
        } else {
          console.warn(`Failed to fetch token ${tokenList[index].symbol}:`, result);
        }
      });

      // Sort by balance value (highest first)
      validTokens.sort((a, b) => {
        const aBalance = parseFloat(a.formattedBalance);
        const bBalance = parseFloat(b.formattedBalance);
        return bBalance - aBalance;
      });

      setTokens(validTokens);
    } catch (err: any) {
      console.error('Failed to fetch wallet tokens:', err);
      setError(err.message || 'Failed to fetch tokens');
      setTokens([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.pkpAddress, chainId, getTokenList]);

  useEffect(() => {
    fetchAllTokens();
  }, [fetchAllTokens]);

  const refetch = useCallback(() => {
    fetchAllTokens();
  }, [fetchAllTokens]);

  const addCustomToken = useCallback(async (tokenAddress: string) => {
    if (!isAuthenticated || !user?.pkpAddress) return null;

    try {
      const rpcUrl = RPC_URLS[chainId];
      if (!rpcUrl) throw new Error(`No RPC URL configured for chain ${chainId}`);

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      const customToken = await fetchTokenBalance(
        provider,
        user.pkpAddress,
        tokenAddress,
        { symbol: 'UNKNOWN', name: 'Unknown Token', logoURI: undefined }
      );

      if (customToken && parseFloat(customToken.formattedBalance) > 0) {
        setTokens(prev => {
          // Check if token already exists
          const exists = prev.some(token => token.address.toLowerCase() === tokenAddress.toLowerCase());
          if (exists) return prev;
          
          // Add and sort
          const newTokens = [...prev, customToken];
          return newTokens.sort((a, b) => parseFloat(b.formattedBalance) - parseFloat(a.formattedBalance));
        });
        
        return customToken;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to add custom token:', error);
      return null;
    }
  }, [isAuthenticated, user?.pkpAddress, chainId]);

  return {
    tokens,
    loading,
    error,
    refetch,
    addCustomToken,
    // Helper functions
    getTotalTokens: () => tokens.length,
    getTokenByAddress: (address: string) => 
      tokens.find(token => token.address.toLowerCase() === address.toLowerCase()),
    getTokensBySymbol: (symbol: string) =>
      tokens.filter(token => token.symbol.toLowerCase().includes(symbol.toLowerCase())),
    hasTokens: tokens.length > 0,
  };
};