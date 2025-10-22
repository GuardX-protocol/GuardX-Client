/**
 * Pyth Network Service
 * Dynamic price feed management using Pyth SDK
 */

import { HermesClient } from '@pythnetwork/hermes-client';

export interface PythPriceFeed {
  id: string;
  symbol: string;
  price: number;
  confidence: number;
  publishTime: number;
  expo: number;
}

export interface PythFeedMetadata {
  id: string;
  symbol: string;
  base: string;
  quote: string;
  description: string;
}

class PythService {
  private client: HermesClient;
  private feedCache: Map<string, PythFeedMetadata> = new Map();
  private priceCache: Map<string, PythPriceFeed> = new Map();
  private feedCacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.client = new HermesClient('https://hermes.pyth.network');
  }

  /**
   * Get all available price feeds with metadata
   */
  async getAllPriceFeeds(): Promise<PythFeedMetadata[]> {
    // Check if cache is still valid
    const now = Date.now();
    if (this.feedCache.size > 0 && (now - this.feedCacheTimestamp) < this.CACHE_DURATION) {
      return Array.from(this.feedCache.values());
    }

    try {
      const feeds = await this.client.getPriceFeeds();
      if (!feeds || !Array.isArray(feeds)) {
        console.warn('Invalid feeds response from Pyth');
        return [];
      }

      const metadata: PythFeedMetadata[] = feeds.map(feed => ({
        id: feed.id || '',
        symbol: this.extractSymbol(feed.attributes?.symbol || feed.id || ''),
        base: feed.attributes?.base || '',
        quote: feed.attributes?.quote_currency || 'USD',
        description: feed.attributes?.description || ''
      })).filter(feed => feed.id && feed.symbol);

      // Clear and update cache
      this.feedCache.clear();
      metadata.forEach(feed => {
        this.feedCache.set(feed.symbol.toUpperCase(), feed);
      });
      this.feedCacheTimestamp = now;

      return metadata;
    } catch (error) {
      console.error('Failed to fetch Pyth price feeds:', error);
      return [];
    }
  }

  /**
   * Get price feed ID for a token symbol
   */
  async getPriceFeedId(symbol: string): Promise<string | null> {
    const upperSymbol = symbol.toUpperCase();
    
    // Check cache first
    if (this.feedCache.has(upperSymbol)) {
      return this.feedCache.get(upperSymbol)!.id;
    }

    // Fetch all feeds if cache is empty
    if (this.feedCache.size === 0) {
      await this.getAllPriceFeeds();
    }

    return this.feedCache.get(upperSymbol)?.id || null;
  }

  /**
   * Get latest price for a token
   */
  async getLatestPrice(symbol: string): Promise<PythPriceFeed | null> {
    try {
      const feedId = await this.getPriceFeedId(symbol);
      if (!feedId) {
        console.warn(`No price feed found for ${symbol}`);
        return null;
      }

      const priceFeeds = await this.client.getLatestPriceUpdates([feedId]);
      if (!priceFeeds.parsed || priceFeeds.parsed.length === 0) {
        return null;
      }

      const feed = priceFeeds.parsed[0];
      const price: PythPriceFeed = {
        id: feedId,
        symbol: symbol.toUpperCase(),
        price: Number(feed.price.price) * Math.pow(10, feed.price.expo),
        confidence: Number(feed.price.conf) * Math.pow(10, feed.price.expo),
        publishTime: feed.price.publish_time,
        expo: feed.price.expo
      };

      // Cache the price
      this.priceCache.set(symbol.toUpperCase(), price);
      
      return price;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get latest prices for multiple tokens
   */
  async getLatestPrices(symbols: string[]): Promise<Map<string, PythPriceFeed>> {
    const results = new Map<string, PythPriceFeed>();
    
    try {
      // Get feed IDs for all symbols
      const feedIds: string[] = [];
      const symbolToFeedId = new Map<string, string>();
      
      for (const symbol of symbols) {
        const feedId = await this.getPriceFeedId(symbol);
        if (feedId) {
          feedIds.push(feedId);
          symbolToFeedId.set(feedId, symbol.toUpperCase());
        }
      }

      if (feedIds.length === 0) {
        return results;
      }

      // Fetch all prices at once
      const priceFeeds = await this.client.getLatestPriceUpdates(feedIds);
      
      if (priceFeeds.parsed) {
        priceFeeds.parsed.forEach(feed => {
          const symbol = symbolToFeedId.get(feed.id);
          if (symbol) {
            const price: PythPriceFeed = {
              id: feed.id,
              symbol,
              price: Number(feed.price.price) * Math.pow(10, feed.price.expo),
              confidence: Number(feed.price.conf) * Math.pow(10, feed.price.expo),
              publishTime: feed.price.publish_time,
              expo: feed.price.expo
            };
            
            results.set(symbol, price);
            this.priceCache.set(symbol, price);
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch multiple prices:', error);
    }

    return results;
  }

  /**
   * Get supported tokens (cached)
   */
  async getSupportedTokens(): Promise<string[]> {
    if (this.feedCache.size === 0) {
      await this.getAllPriceFeeds();
    }
    return Array.from(this.feedCache.keys());
  }

  /**
   * Check if a token is supported
   */
  async isTokenSupported(symbol: string): Promise<boolean> {
    const feedId = await this.getPriceFeedId(symbol);
    return feedId !== null;
  }

  /**
   * Get tokens by category
   */
  async getTokensByCategory(category: 'stablecoins' | 'defi' | 'layer1' | 'layer2' | 'meme'): Promise<string[]> {
    try {
      const allTokens = await this.getSupportedTokens();
      if (!Array.isArray(allTokens)) {
        console.warn('Invalid tokens array from getSupportedTokens');
        return [];
      }
      
      // Define category patterns
      const categoryPatterns = {
        stablecoins: /^(USDC|USDT|DAI|BUSD|TUSD|FRAX|EUROC|FDUSD|USDD|USDP|USTC|CUSD|OUSD)/i,
        defi: /^(LINK|UNI|AAVE|CRV|SUSHI|COMP|MKR|SNX|BAL|LDO|1INCH|YFI|CVX|FXS|GMX|GRT|CAKE|DYDX|PENDLE)/i,
        layer1: /^(ETH|BTC|SOL|AVAX|DOT|ATOM|ADA|NEAR|FTM|ALGO|EOS|ETC|ICP|APT|SUI|SEI|TON|CELO|KAVA|OSMO|FLOW|EGLD|IOTA|KSM|CANTO|EVMOS|ONE|GLMR|AURORA|CFX|KLAY)/i,
        layer2: /^(MATIC|WMATIC|ARB|OP|MNT|IMX|STX|AXL)/i,
        meme: /^(DOGE|SHIB|APE|PEPE|BONK|FLOKI|WOJAK|WLD|PEOPLE|SAMO)/i
      };

      const pattern = categoryPatterns[category];
      if (!pattern) {
        console.warn(`Unknown category: ${category}`);
        return [];
      }

      return allTokens.filter(token => pattern.test(token));
    } catch (error) {
      console.error(`Failed to get tokens for category ${category}:`, error);
      return [];
    }
  }

  /**
   * Extract symbol from Pyth feed description
   */
  private extractSymbol(description: string): string {
    // Extract symbol from descriptions like "BTC/USD" or "Crypto.BTC/USD"
    const match = description.match(/([A-Z0-9]+)\/USD/i);
    return match ? match[1] : description;
  }

  /**
   * Clear caches
   */
  clearCache(): void {
    this.feedCache.clear();
    this.priceCache.clear();
  }
}

// Export singleton instance
export const pythService = new PythService();
export default pythService;