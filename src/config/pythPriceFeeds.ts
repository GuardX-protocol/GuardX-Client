/**
 * Pyth Network Price Feed Configuration
 * Dynamic price feed management using Pyth SDK
 * Source: https://pyth.network/developers/price-feed-ids
 * Last Updated: 2025-10-22
 */

import { pythService } from '../services/pythService';

/**
 * Get Pyth price feed ID for a token symbol (async)
 */
export const getPythPriceFeedId = async (symbol: string): Promise<string | null> => {
  return await pythService.getPriceFeedId(symbol);
};

/**
 * Check if a token has a Pyth price feed (async)
 */
export const hasPythPriceFeed = async (symbol: string): Promise<boolean> => {
  return await pythService.isTokenSupported(symbol);
};

/**
 * Get all supported token symbols (async)
 */
export const getSupportedTokens = async (): Promise<string[]> => {
  return await pythService.getSupportedTokens();
};

/**
 * Get token categories for filtering (async)
 */
export const getTokensByCategory = async (category: 'stablecoins' | 'defi' | 'layer2' | 'layer1' | 'meme'): Promise<string[]> => {
  return await pythService.getTokensByCategory(category);
};

/**
 * Get latest price for a token
 */
export const getLatestPrice = async (symbol: string) => {
  return await pythService.getLatestPrice(symbol);
};

/**
 * Get latest prices for multiple tokens
 */
export const getLatestPrices = async (symbols: string[]) => {
  return await pythService.getLatestPrices(symbols);
};
