import { useState, useEffect, useMemo } from 'react';
import { TokenInfo } from '@uniswap/token-lists';

// Multiple token list sources
const TOKEN_LIST_URLS = [
  'https://tokens.uniswap.org',
  'https://gateway.ipfs.io/ipns/tokens.uniswap.org',
  'https://raw.githubusercontent.com/Uniswap/default-token-list/main/build/uniswap-default.tokenlist.json',
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
    let isMounted = true;
    
    const fetchTokenList = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchPromises = TOKEN_LIST_URLS.map(url =>
          fetch(url, { 
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(15000)
          })
          .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .catch(() => null)
        );

        const results = await Promise.allSettled(fetchPromises);
        
        const allTokens: TokenInfo[] = [];
        const seenSymbols = new Map<string, TokenInfo>();

        for (const result of results) {
          if (result.status === 'fulfilled' && result.value?.tokens) {
            let tokenList = result.value.tokens;
            
            // Only filter by chain if explicitly requested
            if (filterByChain !== undefined) {
              tokenList = tokenList.filter(
                (token: TokenInfo) => token.chainId === filterByChain
              );
            }
            
            // Deduplicate by symbol and validate addresses
            for (const token of tokenList) {
              // Validate Ethereum address format (0x + 40 hex chars)
              if (!token.address || 
                  !token.address.match(/^0x[a-fA-F0-9]{40}$/)) {
                continue; // Skip invalid addresses (like Solana addresses)
              }
              
              const symbolKey = token.symbol.toUpperCase();
              if (!seenSymbols.has(symbolKey)) {
                seenSymbols.set(symbolKey, token);
                allTokens.push(token);
              }
            }
          }
        }

        if (isMounted) {
          if (allTokens.length > 0) {
            allTokens.sort((a, b) => a.symbol.localeCompare(b.symbol));
            console.log(`✅ Loaded ${allTokens.length} tokens from Uniswap`);
            setTokens(allTokens);
          } else {
            console.warn('⚠️ No tokens loaded');
            setTokens([]);
          }
        }
      } catch (err) {
        console.error('❌ Failed to fetch token list:', err);
        if (isMounted) {
          setError(err as Error);
          setTokens([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTokenList();

    return () => {
      isMounted = false;
    };
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
