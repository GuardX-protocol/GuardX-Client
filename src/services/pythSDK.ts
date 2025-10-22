import { HermesClient, PriceFeed } from '@pythnetwork/hermes-client';

class PythSDKService {
  private client: HermesClient;
  private cache: Map<string, any> = new Map();
  private readonly CACHE_TTL = 60000; // 1 minute

  constructor() {
    this.client = new HermesClient('https://hermes.pyth.network');
  }

  async getAllPriceFeeds() {
    const cached = this.cache.get('all_feeds');
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const feeds = await this.client.getPriceFeeds();
    this.cache.set('all_feeds', { data: feeds, timestamp: Date.now() });
    return feeds;
  }

  async getLatestPrices(symbols: string[]) {
    const priceIds = await this.getPriceIds(symbols);
    if (priceIds.length === 0) return new Map();

    const prices = await this.client.getLatestPriceUpdates(priceIds);
    const priceMap = new Map();

    prices.parsed?.forEach((price: any) => {
      const symbol = this.getSymbolFromId(price.id);
      if (symbol) {
        priceMap.set(symbol, {
          price: Number(price.price.price) * Math.pow(10, price.price.expo),
          confidence: Number(price.price.conf) * Math.pow(10, price.price.expo),
          expo: price.price.expo,
          publishTime: price.price.publish_time,
        });
      }
    });

    return priceMap;
  }

  async getPriceHistory(symbol: string, startTime: number, endTime: number) {
    const priceId = await this.getPriceId(symbol);
    if (!priceId) return [];

    // Pyth doesn't provide historical data directly, return mock data
    const points = 50;
    const interval = (endTime - startTime) / points;
    const history = [];

    for (let i = 0; i < points; i++) {
      const timestamp = startTime + (interval * i);
      const variation = Math.sin(i / 5) * 0.1;
      history.push({
        timestamp,
        price: 100 * (1 + variation),
        confidence: 1,
      });
    }

    return history;
  }

  private async getPriceIds(symbols: string[]): Promise<string[]> {
    const feeds = await this.getAllPriceFeeds();
    const ids: string[] = [];

    symbols.forEach(symbol => {
      const feed = feeds.find((f: any) => 
        f.attributes?.symbol?.toUpperCase() === symbol.toUpperCase()
      );
      if (feed) ids.push(feed.id);
    });

    return ids;
  }

  private async getPriceId(symbol: string): Promise<string | null> {
    const feeds = await this.getAllPriceFeeds();
    const feed = feeds.find((f: any) => 
      f.attributes?.symbol?.toUpperCase() === symbol.toUpperCase()
    );
    return feed?.id || null;
  }

  private getSymbolFromId(id: string): string | null {
    // This would need a reverse lookup cache
    return null;
  }

  async getSupportedTokens(): Promise<string[]> {
    const feeds = await this.getAllPriceFeeds();
    return feeds
      .map((f: any) => f.attributes?.symbol)
      .filter((s: string) => s && s.length > 0);
  }
}

export const pythSDK = new PythSDKService();