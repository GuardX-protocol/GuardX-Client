import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PriceData {
  price: number;
  timestamp: number;
  confidence?: number;
}

interface PriceCacheState {
  prices: Record<string, PriceData>;
  lastFetch: number;
  isLoading: boolean;
  setPrice: (symbol: string, data: PriceData) => void;
  setPrices: (prices: Record<string, PriceData>) => void;
  getPrice: (symbol: string) => PriceData | null;
  isStale: (symbol: string, maxAge?: number) => boolean;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const usePriceCache = create<PriceCacheState>()(
  persist(
    (set, get) => ({
      prices: {},
      lastFetch: 0,
      isLoading: false,

      setPrice: (symbol, data) => set(state => ({
        prices: { ...state.prices, [symbol.toUpperCase()]: data }
      })),

      setPrices: (prices) => set({
        prices: Object.fromEntries(
          Object.entries(prices).map(([k, v]) => [k.toUpperCase(), v])
        ),
        lastFetch: Date.now()
      }),

      getPrice: (symbol) => {
        const price = get().prices[symbol.toUpperCase()];
        return price || null;
      },

      isStale: (symbol, maxAge = 60000) => {
        const price = get().prices[symbol.toUpperCase()];
        if (!price) return true;
        return Date.now() - price.timestamp > maxAge;
      },

      setLoading: (loading) => set({ isLoading: loading }),

      clear: () => set({ prices: {}, lastFetch: 0 })
    }),
    {
      name: 'price-cache',
      partialize: (state) => ({ prices: state.prices, lastFetch: state.lastFetch })
    }
  )
);