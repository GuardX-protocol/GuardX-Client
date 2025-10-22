import { useState, useEffect, useCallback, useMemo } from 'react';
import { fastPriceService } from '@/services/fastPriceService';
import { usePriceCache } from '@/store/priceCache';

export const useFastPrice = (symbol: string) => {
  const [price, setPrice] = useState<number | null>(null);
  const { isLoading, getPrice } = usePriceCache();

  const stableSymbol = useMemo(() => symbol, [symbol]);

  useEffect(() => {
    if (!stableSymbol) return;

    const cached = getPrice(stableSymbol);
    if (cached) setPrice(cached.price);

    let mounted = true;
    fastPriceService.getPrice(stableSymbol).then(freshPrice => {
      if (mounted && freshPrice !== null) setPrice(freshPrice);
    });

    return () => { mounted = false; };
  }, [stableSymbol, getPrice]);

  return { price, isLoading };
};

export const useFastPrices = (symbols: string[]) => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const { isLoading, getPrice } = usePriceCache();

  const stableSymbols = useMemo(() => symbols.join(','), [symbols]);

  useEffect(() => {
    if (!symbols.length) return;

    const cached: Record<string, number> = {};
    symbols.forEach(symbol => {
      const price = getPrice(symbol);
      if (price) cached[symbol] = price.price;
    });
    if (Object.keys(cached).length > 0) {
      setPrices(cached);
    }

    let mounted = true;
    fastPriceService.getPrices(symbols).then(freshPrices => {
      if (mounted) setPrices(prev => ({ ...prev, ...freshPrices }));
    });

    return () => { mounted = false; };
  }, [stableSymbols]);

  return { prices, isLoading, getPrice: (symbol: string) => prices[symbol] };
};