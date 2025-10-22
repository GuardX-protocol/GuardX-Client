/**
 * Static list of tokens supported by Pyth Network
 * This prevents API calls during component initialization
 */

export const PYTH_SUPPORTED_TOKENS = [
  // Major cryptocurrencies
  'BTC', 'ETH', 'BNB', 'SOL', 'AVAX', 'MATIC', 'DOT', 'ATOM', 'ADA', 'LINK',
  
  // Stablecoins
  'USDC', 'USDT', 'DAI', 'BUSD', 'FRAX', 'TUSD',
  
  // DeFi tokens
  'UNI', 'AAVE', 'COMP', 'MKR', 'SNX', 'CRV', 'SUSHI', 'YFI', '1INCH',
  
  // Layer 2 tokens
  'ARB', 'OP', 'LRC', 'IMX',
  
  // Other popular tokens
  'DOGE', 'SHIB', 'APE', 'SAND', 'MANA', 'AXS', 'GMT', 'FTM', 'NEAR',
  'ALGO', 'XTZ', 'EGLD', 'FLOW', 'ICP', 'VET', 'THETA', 'FIL', 'EOS',
  'TRX', 'XLM', 'HBAR', 'MINA', 'ROSE', 'KSM', 'KAVA', 'OSMO', 'JUNO',
  
  // Additional tokens
  'LTC', 'BCH', 'XRP', 'XMR', 'ETC', 'ZEC', 'DASH', 'QTUM', 'ZIL',
  'ONT', 'ICX', 'WAVES', 'LSK', 'NANO', 'RVN', 'DGB', 'SYS', 'PIVX'
];

export const isPythSupported = (symbol: string): boolean => {
  return PYTH_SUPPORTED_TOKENS.includes(symbol.toUpperCase());
};

export const getSupportedTokens = (): string[] => {
  return [...PYTH_SUPPORTED_TOKENS];
};