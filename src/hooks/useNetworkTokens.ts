import { useMemo } from 'react';
import { useNetwork } from 'wagmi';
import { useTokenList } from './useTokenList';
import { useEnhancedTokenList, usePopularTokensEnhanced } from './useEnhancedTokenList';
import { TokenInfo } from '@uniswap/token-lists';

// Network-specific token addresses for testnets
const TESTNET_TOKENS: Record<number, TokenInfo[]> = {
  // Arbitrum Sepolia
  421614: [
    {
      chainId: 421614,
      address: '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      logoURI: 'https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png'
    },
    {
      chainId: 421614,
      address: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      logoURI: 'https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png'
    },
    {
      chainId: 421614,
      address: '0xfd064A18f3BF249cf1f87FC203E90D8f650f2d63',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      logoURI: 'https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png'
    }
  ],
  
  // Base Sepolia
  84532: [
    {
      chainId: 84532,
      address: '0x4200000000000000000000000000000000000006',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      logoURI: 'https://tokens.1inch.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png'
    },
    {
      chainId: 84532,
      address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      logoURI: 'https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png'
    }
  ]
};

/**
 * Hook to get tokens available on the current network
 * Filters tokens by current chain and provides testnet fallbacks
 */
export const useNetworkTokens = () => {
  const { chain } = useNetwork();
  const { tokens: allTokens, isLoading, error } = useTokenList();

  const networkTokens = useMemo(() => {
    if (!chain) return [];

    // For testnets, use predefined token list
    if (TESTNET_TOKENS[chain.id]) {
      console.log(`✅ Using testnet tokens for chain ${chain.id}`);
      return TESTNET_TOKENS[chain.id];
    }

    // For mainnets, filter from Uniswap list
    const filteredTokens = allTokens.filter(token => token.chainId === chain.id);
    
    if (filteredTokens.length > 0) {
      console.log(`✅ Found ${filteredTokens.length} tokens for chain ${chain.id}`);
      return filteredTokens.slice(0, 50); // Limit to 50 tokens for performance
    }

    // Fallback: return empty array
    console.warn(`⚠️ No tokens found for chain ${chain.id}`);
    return [];
  }, [chain, allTokens]);

  return {
    tokens: networkTokens,
    isLoading,
    error,
    chainId: chain?.id,
    chainName: chain?.name,
  };
};

/**
 * Hook to get popular tokens for the current network
 * Now uses enhanced token list with major cryptocurrencies
 */
export const usePopularTokens = () => {
  return usePopularTokensEnhanced();
};

/**
 * Hook to get enhanced network tokens (includes major tokens + network-specific)
 */
export const useEnhancedNetworkTokens = () => {
  return useEnhancedTokenList();
};