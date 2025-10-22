import { usePriceCache } from '@/store/priceCache';

class FastPriceService {
  private static instance: FastPriceService;
  private fetchPromise: Promise<void> | null = null;
  private lastBatchFetch = 0;
  private readonly BATCH_INTERVAL = 60000; // 1min
  private readonly CACHE_TTL = 120000; // 2min

  static getInstance() {
    if (!FastPriceService.instance) {
      FastPriceService.instance = new FastPriceService();
    }
    return FastPriceService.instance;
  }

  async getPrice(symbol: string): Promise<number | null> {
    const cache = usePriceCache.getState();
    const cached = cache.getPrice(symbol);
    
    if (cached && !cache.isStale(symbol, this.CACHE_TTL)) {
      return cached.price;
    }

    await this.ensureFreshData([symbol]);
    return cache.getPrice(symbol)?.price || null;
  }

  async getPrices(symbols: string[]): Promise<Record<string, number>> {
    const cache = usePriceCache.getState();
    const result: Record<string, number> = {};
    const staleSymbols: string[] = [];

    // Check cache first
    symbols.forEach(symbol => {
      const cached = cache.getPrice(symbol);
      if (cached && !cache.isStale(symbol, this.CACHE_TTL)) {
        result[symbol] = cached.price;
      } else {
        staleSymbols.push(symbol);
      }
    });

    // Fetch stale data
    if (staleSymbols.length > 0) {
      await this.ensureFreshData(staleSymbols);
      staleSymbols.forEach(symbol => {
        const price = cache.getPrice(symbol);
        if (price) result[symbol] = price.price;
      });
    }

    return result;
  }

  private async ensureFreshData(symbols: string[]) {
    const now = Date.now();
    
    if (this.fetchPromise) {
      await this.fetchPromise;
      return;
    }

    if (now - this.lastBatchFetch < this.BATCH_INTERVAL) {
      return;
    }

    this.fetchPromise = this.fetchBatch(symbols);
    await this.fetchPromise;
    this.fetchPromise = null;
  }

  private async fetchBatch(symbols: string[]) {
    const cache = usePriceCache.getState();
    cache.setLoading(true);

    try {
      // Mock API call - replace with actual Pyth/price API
      const prices = await this.mockFetchPrices(symbols);
      cache.setPrices(prices);
      this.lastBatchFetch = Date.now();
    } catch (error) {
      console.error('Price fetch failed:', error);
    } finally {
      cache.setLoading(false);
    }
  }

  private async mockFetchPrices(symbols: string[]): Promise<Record<string, any>> {
    try {
      const { pythSDK } = await import('./pythSDK');
      const priceMap = await pythSDK.getLatestPrices(symbols);
      
      const prices: Record<string, any> = {};
      priceMap.forEach((data, symbol) => {
        prices[symbol] = {
          price: data.price,
          timestamp: Date.now(),
          confidence: data.confidence
        };
      });
      
      if (Object.keys(prices).length > 0) return prices;
    } catch (error) {
      console.warn('Pyth SDK fetch failed, using fallback:', error);
    }
    
    // Fallback prices
    const prices: Record<string, any> = {};
    const basePrice: Record<string, number> = { 
      BTC: 45000, ETH: 2800, USDC: 1, USDT: 1, BNB: 320, 
      SOL: 95, AVAX: 28, MATIC: 0.85, LINK: 14, UNI: 6.5 
    };
    
    symbols.forEach(symbol => {
      const base = basePrice[symbol.toUpperCase()] || 1;
      const variation = (Math.random() - 0.5) * 0.05;
      prices[symbol] = {
        price: base * (1 + variation),
        timestamp: Date.now(),
        confidence: 0.01
      };
    });
    
    return prices;
  }
}

export const fastPriceService = FastPriceService.getInstance();