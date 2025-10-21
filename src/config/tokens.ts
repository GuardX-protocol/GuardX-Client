import { TokenInfo } from '@uniswap/token-lists';

/**
 * Token configuration interface
 */
export interface TokenConfig {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUri?: string;
  pythPriceId?: string;
  isStablecoin?: boolean;
  chainId?: number;
}

/**
 * Stablecoin identifiers
 */
const STABLECOIN_SYMBOLS = new Set([
  'USDC', 'USDT', 'DAI', 'BUSD', 'FRAX', 'TUSD', 'USDD', 'GUSD', 'USDP', 'LUSD', 'SUSD'
]);

/**
 * Convert Uniswap TokenInfo to TokenConfig
 * Time Complexity: O(1)
 */
export const tokenInfoToConfig = (token: TokenInfo): TokenConfig => ({
  address: token.address,
  symbol: token.symbol,
  name: token.name,
  decimals: token.decimals,
  logoUri: token.logoURI,
  isStablecoin: STABLECOIN_SYMBOLS.has(token.symbol.toUpperCase()),
  chainId: token.chainId,
});

/**
 * Check if token is a stablecoin
 * Time Complexity: O(1)
 */
export const isStablecoin = (symbol: string): boolean => {
  return STABLECOIN_SYMBOLS.has(symbol.toUpperCase());
};

/**
 * Get stablecoins from token list
 * Time Complexity: O(n)
 */
export const getStablecoins = (tokens: TokenInfo[]): TokenInfo[] => {
  return tokens.filter(token => isStablecoin(token.symbol));
};

/**
 * Format token amount with proper decimals
 * Time Complexity: O(1)
 */
export const formatTokenAmount = (amount: bigint, decimals: number): string => {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const remainder = amount % divisor;
  const remainderStr = remainder.toString().padStart(decimals, '0');
  const trimmed = remainderStr.replace(/0+$/, '') || '0';
  return trimmed === '0' ? whole.toString() : `${whole}.${trimmed}`;
};

/**
 * Parse token amount to bigint
 * Time Complexity: O(1)
 */
export const parseTokenAmount = (amount: string, decimals: number): bigint => {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
};

/**
 * Legacy exports for backward compatibility
 */
export const STABLECOINS: TokenConfig[] = [];
export const TOKEN_LIST: TokenConfig[] = [];

// Note: Use PYTH_PRICE_FEED_IDS from pythPriceFeeds.ts for price feed IDs
// Note: Use usePythContractPrices hook for current prices from Pyth contract
// Note: Use useTokenList hook for dynamic token list
