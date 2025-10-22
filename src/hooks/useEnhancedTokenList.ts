import { useMemo } from 'react';
import { useNetwork } from 'wagmi';
import { TokenInfo } from '@uniswap/token-lists';
import { useTokenList } from './useTokenList';
import { getMajorTokens, getMajorTokensByCategory } from '@/config/majorTokens';
import { isPythSupported } from '@/config/supportedTokens';

/**
 * Enhanced token list that combines major tokens with network-specific tokens
 * Prioritizes tokens with Pyth price feeds for better price data
 */
export const useEnhancedTokenList = () => {
  const { chain } = useNetwork();
  const { tokens: uniswapTokens, isLoading, error } = useTokenList();

  const enhancedTokens = useMemo(() => {
    const majorTokens = getMajorTokens();
    const networkTokens = chain ? uniswapTokens.filter(token => token.chainId === chain.id) : [];
    
    // Create a map to avoid duplicates (prioritize major tokens)
    const tokenMap = new Map<string, TokenInfo>();
    
    // Add major tokens first (these have priority)
    majorTokens.forEach(token => {
      const key = token.symbol.toUpperCase();
      tokenMap.set(key, token);
    });
    
    // Add network-specific tokens (only if not already present)
    networkTokens.forEach(token => {
      const key = token.symbol.toUpperCase();
      if (!tokenMap.has(key)) {
        tokenMap.set(key, token);
      }
    });
    
    // Convert back to array and sort by priority
    const allTokens = Array.from(tokenMap.values());
    
    // Sort tokens by priority: major tokens with price feeds first
    return allTokens.sort((a, b) => {
      const aHasPrice = isPythSupported(a.symbol);
      const bHasPrice = isPythSupported(b.symbol);
      const aIsMajor = majorTokens.some(t => t.symbol === a.symbol);
      const bIsMajor = majorTokens.some(t => t.symbol === b.symbol);
      
      // Priority: Major tokens with price feeds > Major tokens > Tokens with price feeds > Others
      if (aIsMajor && aHasPrice && !(bIsMajor && bHasPrice)) return -1;
      if (bIsMajor && bHasPrice && !(aIsMajor && aHasPrice)) return 1;
      if (aIsMajor && !bIsMajor) return -1;
      if (bIsMajor && !aIsMajor) return 1;
      if (aHasPrice && !bHasPrice) return -1;
      if (bHasPrice && !aHasPrice) return 1;
      
      return a.symbol.localeCompare(b.symbol);
    });
  }, [chain, uniswapTokens]);

  return {
    tokens: enhancedTokens,
    isLoading,
    error,
    chainId: chain?.id,
    chainName: chain?.name,
  };
};

/**
 * Get popular tokens for display (top tokens with price feeds)
 */
export const usePopularTokensEnhanced = () => {
  const { tokens } = useEnhancedTokenList();
  
  const popularTokens = useMemo(() => {
    // Ensure we have stable arrays
    const safeTokens = tokens || [];
    
    // Get tokens that have Pyth price feeds
    const tokensWithPrices = safeTokens.filter(token => isPythSupported(token.symbol));
    
    // Define priority order for popular tokens
    const prioritySymbols = [
      'BTC', 'ETH', 'BNB', 'USDC', 'USDT', 'SOL', 'AVAX', 'MATIC',
      'LINK', 'UNI', 'AAVE', 'ARB', 'OP', 'DOT', 'ATOM', 'ADA'
    ];
    
    const prioritized: TokenInfo[] = [];
    const remaining: TokenInfo[] = [];
    
    tokensWithPrices.forEach(token => {
      const index = prioritySymbols.indexOf(token.symbol);
      if (index !== -1) {
        prioritized[index] = token;
      } else {
        remaining.push(token);
      }
    });
    
    // Combine prioritized tokens (filter out undefined) with remaining
    return [...prioritized.filter(Boolean), ...remaining].slice(0, 20);
  }, [tokens]);

  return popularTokens;
};

/**
 * Get tokens by category with enhanced metadata
 */
export const useTokensByCategory = (category: 'layer1' | 'stablecoins' | 'defi' | 'layer2' | 'meme') => {
  const { tokens } = useEnhancedTokenList();
  
  const categoryTokens = useMemo(() => {
    const majorCategoryTokens = getMajorTokensByCategory(category);
    const majorSymbols = majorCategoryTokens.map(t => t.symbol.toUpperCase());
    
    // Get tokens from our enhanced list that match the category
    return tokens.filter(token => 
      majorSymbols.includes(token.symbol.toUpperCase()) && 
      isPythSupported(token.symbol)
    );
  }, [tokens, category]);

  return categoryTokens;
};

/**
 * Get top tokens for price display (guaranteed to have price feeds)
 */
export const useTopTokensForPrices = (limit: number = 12) => {
  const popularTokens = usePopularTokensEnhanced();
  
  return useMemo(() => {
    const safeTokens = popularTokens || [];
    return safeTokens.slice(0, limit);
  }, [popularTokens, limit]);
};