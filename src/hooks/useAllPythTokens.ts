import { useState, useEffect, useMemo } from 'react';
import { TokenInfo } from '@uniswap/token-lists';
import { pythService } from '@/services/pythService';
import { getMajorTokens, getMajorTokenBySymbol } from '@/config/majorTokens';
import { useNetwork } from 'wagmi';

interface PythTokenInfo extends TokenInfo {
  pythFeedId?: string;
  category?: string;
  hasPrice?: boolean;
}

/**
 * Hook to get all tokens supported by Pyth Network
 * This provides a comprehensive list of tokens for deposit/trading
 */
export const useAllPythTokens = () => {
  const { chain } = useNetwork();
  const [pythTokens, setPythTokens] = useState<PythTokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all Pyth-supported tokens
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts
    
    const fetchPythTokens = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);

      try {
        // Get all price feeds from Pyth
        const priceFeeds = await pythService.getAllPriceFeeds();
        
        if (!priceFeeds || priceFeeds.length === 0) {
          console.warn('No price feeds received from Pyth');
          setError('No price feeds available');
          return;
        }

        console.log(`✅ Fetched ${priceFeeds.length} price feeds from Pyth`);

        // Convert Pyth feeds to TokenInfo format and deduplicate
        const tokenMap = new Map<string, PythTokenInfo>();
        
        priceFeeds.forEach((feed) => {
          // Skip invalid or empty symbols first
          if (!feed.symbol || feed.symbol.length < 2) {
            return;
          }

          // Create a unique key for deduplication (just use symbol for now)
          const uniqueKey = feed.symbol.toUpperCase();
          
          // Skip if we already have this token (avoid duplicates)
          if (tokenMap.has(uniqueKey)) {
            return;
          }

          // Try to get token info from major tokens first
          const majorToken = getMajorTokenBySymbol(feed.symbol);
          
          let token: PythTokenInfo;
          
          if (majorToken) {
            token = {
              ...majorToken,
              pythFeedId: feed.id,
              hasPrice: true,
              category: getCategoryForToken(feed.symbol),
            };
          } else {
            // Create token info for tokens not in major list
            token = {
              chainId: chain?.id || 1,
              address: feed.id, // Use feed ID as unique address (already starts with 0x)
              name: feed.description || `${feed.symbol} Token`,
              symbol: feed.symbol,
              decimals: getDecimalsForToken(feed.symbol),
              logoURI: getLogoForToken(feed.symbol),
              pythFeedId: feed.id,
              hasPrice: true,
              category: getCategoryForToken(feed.symbol),
            };
          }

          tokenMap.set(uniqueKey, token);
        });

        const tokens = Array.from(tokenMap.values());

        // Sort tokens by category and popularity
        const sortedTokens = tokens.sort((a, b) => {
          // Major tokens first
          const aMajor = getMajorTokenBySymbol(a.symbol) ? 1 : 0;
          const bMajor = getMajorTokenBySymbol(b.symbol) ? 1 : 0;
          if (aMajor !== bMajor) return bMajor - aMajor;

          // Then by category priority
          const categoryPriority = {
            'layer1': 1,
            'stablecoins': 2,
            'defi': 3,
            'layer2': 4,
            'meme': 5,
            'other': 6,
          };
          
          const aPriority = categoryPriority[a.category as keyof typeof categoryPriority] || 6;
          const bPriority = categoryPriority[b.category as keyof typeof categoryPriority] || 6;
          
          if (aPriority !== bPriority) return aPriority - bPriority;

          // Finally alphabetically
          return a.symbol.localeCompare(b.symbol);
        });

        if (!isMounted) return;
        
        setPythTokens(sortedTokens);
        console.log(`✅ Processed ${sortedTokens.length} unique tokens from Pyth`);
        
        // Debug: Check for any potential duplicates (only log if found)
        const symbolCounts = new Map<string, number>();
        sortedTokens.forEach(token => {
          const count = symbolCounts.get(token.symbol) || 0;
          symbolCounts.set(token.symbol, count + 1);
        });
        
        const duplicates = Array.from(symbolCounts.entries()).filter(([, count]) => count > 1);
        if (duplicates.length > 0) {
          console.warn(`⚠️ Found ${duplicates.length} duplicate symbols:`, duplicates.map(([symbol]) => symbol));
        }
        
      } catch (err) {
        console.error('Failed to fetch Pyth tokens:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tokens');
        
        // Fallback to major tokens
        if (isMounted) {
          const majorTokens = getMajorTokens().map(token => ({
            ...token,
            hasPrice: false,
            category: getCategoryForToken(token.symbol),
          }));
          setPythTokens(majorTokens);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPythTokens();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [chain?.id]);

  // Categorized tokens
  const tokensByCategory = useMemo(() => {
    const categories = {
      layer1: pythTokens.filter(t => t.category === 'layer1'),
      stablecoins: pythTokens.filter(t => t.category === 'stablecoins'),
      defi: pythTokens.filter(t => t.category === 'defi'),
      layer2: pythTokens.filter(t => t.category === 'layer2'),
      meme: pythTokens.filter(t => t.category === 'meme'),
      other: pythTokens.filter(t => t.category === 'other'),
    };

    return categories;
  }, [pythTokens]);

  // Popular tokens (first 20) - memoized for performance
  const popularTokens = useMemo(() => {
    return pythTokens.slice(0, 20);
  }, [pythTokens]);

  // Memoized return object to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    tokens: pythTokens,
    tokensByCategory,
    popularTokens,
    isLoading,
    error,
    totalCount: pythTokens.length,
  }), [pythTokens, tokensByCategory, popularTokens, isLoading, error]);

  return returnValue;
};

/**
 * Get category for a token symbol
 */
function getCategoryForToken(symbol: string): string {
  const upperSymbol = symbol.toUpperCase();
  
  if (/^(USDC|USDT|DAI|BUSD|TUSD|FRAX|EUROC|FDUSD|USDD|USDP|USTC|CUSD|OUSD)/.test(upperSymbol)) {
    return 'stablecoins';
  }
  
  if (/^(BTC|ETH|BNB|SOL|AVAX|DOT|ATOM|ADA|NEAR|FTM|ALGO|EOS|ETC|ICP|APT|SUI|SEI|TON|CELO|KAVA|OSMO|FLOW|EGLD|IOTA|KSM|CANTO|EVMOS|ONE|GLMR|AURORA|CFX|KLAY)/.test(upperSymbol)) {
    return 'layer1';
  }
  
  if (/^(LINK|UNI|AAVE|CRV|SUSHI|COMP|MKR|SNX|BAL|LDO|1INCH|YFI|CVX|FXS|GMX|GRT|CAKE|DYDX|PENDLE)/.test(upperSymbol)) {
    return 'defi';
  }
  
  if (/^(MATIC|WMATIC|ARB|OP|MNT|IMX|STX|AXL)/.test(upperSymbol)) {
    return 'layer2';
  }
  
  if (/^(DOGE|SHIB|APE|PEPE|BONK|FLOKI|WOJAK|WLD|PEOPLE|SAMO)/.test(upperSymbol)) {
    return 'meme';
  }
  
  return 'other';
}

/**
 * Get appropriate decimals for a token
 */
function getDecimalsForToken(symbol: string): number {
  const upperSymbol = symbol.toUpperCase();
  
  // Bitcoin-based tokens typically use 8 decimals
  if (/^(BTC|WBTC|DOGE)/.test(upperSymbol)) {
    return 8;
  }
  
  // USDC/USDT typically use 6 decimals
  if (/^(USDC|USDT)/.test(upperSymbol)) {
    return 6;
  }
  
  // Solana uses 9 decimals
  if (upperSymbol === 'SOL') {
    return 9;
  }
  
  // Most ERC20 tokens use 18 decimals
  return 18;
}

/**
 * Get logo URL for a token
 */
function getLogoForToken(symbol: string): string {
  const upperSymbol = symbol.toUpperCase();
  
  // Use CoinGecko API for logos
  const logoMap: Record<string, string> = {
    'BTC': 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
    'ETH': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
    'BNB': 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
    'SOL': 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
    'USDC': 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
    'USDT': 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    'DAI': 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png',
    'LINK': 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
    'UNI': 'https://assets.coingecko.com/coins/images/12504/small/uni.jpg',
    'AAVE': 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png',
    'MATIC': 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
    'ARB': 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg',
    'OP': 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png',
    'AVAX': 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
    'DOT': 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png',
    'ATOM': 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png',
    'ADA': 'https://assets.coingecko.com/coins/images/975/small/cardano.png',
    'DOGE': 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png',
    'SHIB': 'https://assets.coingecko.com/coins/images/11939/small/shiba.png',
    'APE': 'https://assets.coingecko.com/coins/images/24383/small/apecoin.jpg',
  };
  
  return logoMap[upperSymbol] || `https://assets.coingecko.com/coins/images/1/small/bitcoin.png`;
}

export default useAllPythTokens;