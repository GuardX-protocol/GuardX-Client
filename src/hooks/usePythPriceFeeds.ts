import { useState, useEffect } from 'react';

/**
 * Pyth price feed interface
 */
interface PythPriceFeed {
  id: string;
  attributes: {
    symbol: string;
    asset_type: string;
    base: string;
    quote_currency: string;
    description: string;
  };
}

/**
 * Fetch all available Pyth price feeds dynamically
 * Source: Pyth Network API
 */
export const usePythPriceFeeds = () => {
  const [priceFeeds, setPriceFeeds] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPriceFeeds = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch from Pyth's price feed API
        const response = await fetch('https://hermes.pyth.network/api/price_feed_ids', {
          headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const feedMap = new Map<string, string>();

        // Map symbols to price feed IDs
        if (Array.isArray(data)) {
          data.forEach((feed: PythPriceFeed) => {
            if (feed.attributes && feed.attributes.symbol) {
              const symbol = feed.attributes.symbol.toUpperCase();
              // Store the price feed ID
              feedMap.set(symbol, feed.id);
              
              // Also store common variations
              if (symbol.includes('/')) {
                const base = symbol.split('/')[0];
                feedMap.set(base, feed.id);
              }
            }
          });
        }

        console.log(`✅ Loaded ${feedMap.size} Pyth price feeds`);
        setPriceFeeds(feedMap);
      } catch (err) {
        console.error('❌ Failed to fetch Pyth price feeds:', err);
        setError(err as Error);
        
        // Fallback to hardcoded major tokens
        const fallbackFeeds = new Map<string, string>([
          ['ETH', '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace'],
          ['WETH', '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace'],
          ['BTC', '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43'],
          ['WBTC', '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43'],
          ['USDC', '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a'],
          ['USDT', '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b'],
          ['DAI', '0xb0948a5e5313200c632b51bb5ca32f6de0d36e9950a942d19751e833f70dabfd'],
        ]);
        setPriceFeeds(fallbackFeeds);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriceFeeds();
  }, []);

  return {
    priceFeeds,
    isLoading,
    error,
    getPriceFeedId: (symbol: string) => priceFeeds.get(symbol.toUpperCase()),
    hasPriceFeed: (symbol: string) => priceFeeds.has(symbol.toUpperCase()),
  };
};

/**
 * Get price feed ID for a token symbol
 */
export const getPythPriceFeedId = (symbol: string, priceFeeds: Map<string, string>): string | undefined => {
  return priceFeeds.get(symbol.toUpperCase());
};
