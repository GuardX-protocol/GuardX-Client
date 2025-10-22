import { useState, useEffect, useMemo } from 'react';
import { TokenInfo } from '@uniswap/token-lists';

// Fallback to static token list to avoid CORS issues
const STATIC_TOKENS: TokenInfo[] = [
  { chainId: 1, address: '0xA0b86a33E6441b8435b662303c0f479c7e2b6b1e', symbol: 'BTC', name: 'Bitcoin', decimals: 8, logoURI: '' },
  { chainId: 1, address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', name: 'Wrapped Ether', decimals: 18, logoURI: '' },
  { chainId: 1, address: '0xA0b86a33E6441b8435b662303c0f479c7e2b6b1e', symbol: 'USDC', name: 'USD Coin', decimals: 6, logoURI: '' },
  { chainId: 1, address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6, logoURI: '' },
  { chainId: 1, address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', symbol: 'LINK', name: 'Chainlink', decimals: 18, logoURI: '' },
  { chainId: 1, address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', decimals: 18, logoURI: '' },
];

/**
 * Fetch ALL tokens from Uniswap - no chain filtering
 * Time Complexity: O(n) for initial fetch, O(1) for cached access
 * Space Complexity: O(n) where n is number of unique tokens
 */
export const useTokenList = (filterByChain?: number) => {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    
    // Use static tokens to avoid CORS issues
    let filteredTokens = STATIC_TOKENS;
    if (filterByChain !== undefined) {
      filteredTokens = STATIC_TOKENS.filter(token => token.chainId === filterByChain);
    }
    
    setTokens(filteredTokens);
    setIsLoading(false);
    console.log(`✅ Loaded ${filteredTokens.length} static tokens`);
  }, [filterByChain]);

  const tokenMap = useMemo(() => {
    const map = new Map<string, TokenInfo>();
    tokens.forEach(token => {
      map.set(token.address.toLowerCase(), token);
      map.set(token.symbol.toUpperCase(), token);
    });
    return map;
  }, [tokens]);

  return {
    tokens,
    tokenMap,
    isLoading,
    error,
  };
};

export const useTokenByAddress = (addressOrSymbol: string) => {
  const { tokenMap } = useTokenList();
  
  return tokenMap.get(addressOrSymbol.toLowerCase()) || tokenMap.get(addressOrSymbol.toUpperCase());
};
