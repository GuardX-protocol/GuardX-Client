import { useState, useEffect, useMemo } from 'react';
import { usePythPriceFeeds } from './usePythPriceFeeds';

interface PythPrice {
    id: string;
    price: {
        price: string;
        conf: string;
        expo: number;
        publish_time: number;
    };
    ema_price: {
        price: string;
        conf: string;
        expo: number;
        publish_time: number;
    };
}

interface FormattedPrice {
    price: number;
    formattedPrice: string;
    confidence: string;
    expo: number;
    publishTime: number;
}

/**
 * Fetch current prices from Pyth Hermes API
 * This is a REST API that doesn't require blockchain calls
 */
export const usePythCurrentPrices = (symbols: string[]) => {
    const { priceFeeds, isLoading: isLoadingFeeds } = usePythPriceFeeds();
    const [prices, setPrices] = useState<Map<string, FormattedPrice>>(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Get price feed IDs for requested symbols
    const priceFeedIds = useMemo(() => {
        const ids: string[] = [];
        symbols.forEach(symbol => {
            const feedId = priceFeeds.get(symbol.toUpperCase());
            if (feedId) {
                ids.push(feedId);
            }
        });
        return ids;
    }, [symbols, priceFeeds]);

    useEffect(() => {
        if (isLoadingFeeds || priceFeedIds.length === 0) {
            return;
        }

        const fetchPrices = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Fetch latest prices from Pyth Hermes API
                const idsParam = priceFeedIds.map(id => `ids[]=${id}`).join('&');
                const response = await fetch(
                    `https://hermes.pyth.network/api/latest_price_feeds?${idsParam}`,
                    {
                        headers: { 'Accept': 'application/json' },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                const priceMap = new Map<string, FormattedPrice>();

                if (Array.isArray(data)) {
                    data.forEach((item: PythPrice) => {
                        const priceValue = parseFloat(item.price.price);
                        const expo = item.price.expo;
                        const actualPrice = priceValue * Math.pow(10, expo);

                        // Find symbol for this price feed ID
                        const symbol = Array.from(priceFeeds.entries())
                            .find(([_, id]) => id === item.id)?.[0];

                        if (symbol) {
                            priceMap.set(symbol, {
                                price: actualPrice,
                                formattedPrice: actualPrice.toFixed(Math.abs(expo) > 2 ? 2 : Math.abs(expo)),
                                confidence: item.price.conf,
                                expo: expo,
                                publishTime: item.price.publish_time,
                            });
                        }
                    });
                }

                console.log(`✅ Fetched ${priceMap.size} prices from Pyth`);
                setPrices(priceMap);
            } catch (err) {
                console.error('❌ Failed to fetch Pyth prices:', err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrices();

        // Refresh prices every 10 seconds
        const interval = setInterval(fetchPrices, 10000);

        return () => clearInterval(interval);
    }, [priceFeedIds, isLoadingFeeds, priceFeeds]);

    return {
        prices,
        isLoading: isLoadingFeeds || isLoading,
        error,
        getPrice: (symbol: string) => prices.get(symbol.toUpperCase()),
    };
};
