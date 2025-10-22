import { TokenInfo } from '@uniswap/token-lists';
import { useFastPrices, useFastPrice } from './useFastPrice';



export const useLivePrices = (tokens: TokenInfo[]) => {
    const symbols = tokens.map(t => t.symbol);
    const { prices, isLoading } = useFastPrices(symbols);
    
    const priceMap = new Map(
        Object.entries(prices).map(([symbol, price]) => [
            symbol.toUpperCase(),
            { price, formattedPrice: price.toFixed(2), confidence: '0', timestamp: Date.now(), isValid: true }
        ])
    );
    
    return {
        priceMap,
        isLoading,
        isError: false,
        refetch: () => Promise.resolve(),
        getPrice: (symbol: string) => priceMap.get(symbol.toUpperCase()),
    };
};

/**
 * Get price for a single token using optimized store
 */
export const useLivePrice = (symbol: string) => {
    const { price, isLoading } = useFastPrice(symbol);
    return {
        priceData: price ? { price, formattedPrice: price.toFixed(2), confidence: '0', timestamp: Date.now(), isValid: true } : null,
        isLoading,
        isError: false,
        refetch: () => Promise.resolve(),
    };
};
