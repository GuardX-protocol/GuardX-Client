import { TokenInfo } from '@uniswap/token-lists';

/**
 * Testnet token addresses from FRONTEND_INTEGRATION.md
 * These are verified testnet tokens for Arbitrum Sepolia
 */
export const ARBITRUM_SEPOLIA_TOKENS: TokenInfo[] = [
  // Native ETH (zero address)
  {
    chainId: 421614,
    address: '0x0000000000000000000000000000000000000000',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
  },
  // USDC on Arbitrum Sepolia
  {
    chainId: 421614,
    address: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
  },
  // USDT on Arbitrum Sepolia
  {
    chainId: 421614,
    address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png'
  },
  // WETH on Arbitrum Sepolia
  {
    chainId: 421614,
    address: '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/2518/small/weth.png'
  }
];

/**
 * Get testnet tokens for a specific chain
 */
export const getTestnetTokens = (chainId: number): TokenInfo[] => {
  switch (chainId) {
    case 421614: // Arbitrum Sepolia
      return ARBITRUM_SEPOLIA_TOKENS;
    default:
      return [];
  }
};

/**
 * Check if an address is a verified testnet token
 */
export const isVerifiedTestnetToken = (address: string, chainId: number): boolean => {
  const testnetTokens = getTestnetTokens(chainId);
  return testnetTokens.some(token => 
    token.address.toLowerCase() === address.toLowerCase()
  );
};

/**
 * Get testnet token by address
 */
export const getTestnetTokenByAddress = (address: string, chainId: number): TokenInfo | undefined => {
  const testnetTokens = getTestnetTokens(chainId);
  return testnetTokens.find(token => 
    token.address.toLowerCase() === address.toLowerCase()
  );
};

/**
 * Get testnet token by symbol
 */
export const getTestnetTokenBySymbol = (symbol: string, chainId: number): TokenInfo | undefined => {
  const testnetTokens = getTestnetTokens(chainId);
  return testnetTokens.find(token => 
    token.symbol.toUpperCase() === symbol.toUpperCase()
  );
};