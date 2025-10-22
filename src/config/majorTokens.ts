import { TokenInfo } from '@uniswap/token-lists';

/**
 * Major cryptocurrency tokens with comprehensive metadata
 * These are the most popular tokens that should always be available for price display
 */
export const MAJOR_TOKENS: TokenInfo[] = [
  // Bitcoin
  {
    chainId: 1, // Ethereum mainnet
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    decimals: 8,
    logoURI: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png'
  },
  {
    chainId: 1,
    address: '0x0000000000000000000000000000000000000001', // Virtual BTC
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    logoURI: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png'
  },

  // Ethereum
  {
    chainId: 1,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/2518/small/weth.png'
  },
  {
    chainId: 1,
    address: '0x0000000000000000000000000000000000000000', // Native ETH
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
  },

  // BNB
  {
    chainId: 56, // BSC
    address: '0x0000000000000000000000000000000000000000', // Native BNB
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png'
  },

  // Stablecoins
  {
    chainId: 1,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
  },
  {
    chainId: 1,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png'
  },
  {
    chainId: 1,
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png'
  },

  // DeFi Blue Chips
  {
    chainId: 1,
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    name: 'Chainlink',
    symbol: 'LINK',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png'
  },
  {
    chainId: 1,
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    name: 'Uniswap',
    symbol: 'UNI',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/12504/small/uni.jpg'
  },
  {
    chainId: 1,
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    name: 'Aave',
    symbol: 'AAVE',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png'
  },

  // Layer 2 Tokens
  {
    chainId: 137, // Polygon
    address: '0x0000000000000000000000000000000000001010',
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png'
  },
  {
    chainId: 42161, // Arbitrum
    address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    name: 'Arbitrum',
    symbol: 'ARB',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg'
  },
  {
    chainId: 10, // Optimism
    address: '0x4200000000000000000000000000000000000042',
    name: 'Optimism',
    symbol: 'OP',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png'
  },

  // Other Layer 1s
  {
    chainId: 1,
    address: '0x0000000000000000000000000000000000000002', // Virtual SOL
    name: 'Solana',
    symbol: 'SOL',
    decimals: 9,
    logoURI: 'https://assets.coingecko.com/coins/images/4128/small/solana.png'
  },
  {
    chainId: 43114, // Avalanche
    address: '0x0000000000000000000000000000000000000000',
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png'
  },
  {
    chainId: 1,
    address: '0x0000000000000000000000000000000000000003', // Virtual DOT
    name: 'Polkadot',
    symbol: 'DOT',
    decimals: 10,
    logoURI: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png'
  },
  {
    chainId: 1,
    address: '0x0000000000000000000000000000000000000004', // Virtual ATOM
    name: 'Cosmos Hub',
    symbol: 'ATOM',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png'
  },
  {
    chainId: 1,
    address: '0x0000000000000000000000000000000000000005', // Virtual ADA
    name: 'Cardano',
    symbol: 'ADA',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/975/small/cardano.png'
  },

  // Popular Meme/Community Tokens
  {
    chainId: 1,
    address: '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
    name: 'ApeCoin',
    symbol: 'APE',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/24383/small/apecoin.jpg'
  },
  {
    chainId: 1,
    address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    name: 'Shiba Inu',
    symbol: 'SHIB',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png'
  },
  {
    chainId: 1,
    address: '0x0000000000000000000000000000000000000006', // Virtual DOGE
    name: 'Dogecoin',
    symbol: 'DOGE',
    decimals: 8,
    logoURI: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png'
  },

  // Additional DeFi Tokens
  {
    chainId: 1,
    address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    name: 'Curve DAO Token',
    symbol: 'CRV',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/12124/small/Curve.png'
  },
  {
    chainId: 1,
    address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
    name: 'SushiSwap',
    symbol: 'SUSHI',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/12271/small/512x512_Logo_no_chop.png'
  },
  {
    chainId: 1,
    address: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
    name: 'Compound',
    symbol: 'COMP',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/10775/small/COMP.png'
  },
  {
    chainId: 1,
    address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
    name: 'Maker',
    symbol: 'MKR',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png'
  },
];

/**
 * Get major tokens for display purposes (price tracking, etc.)
 * These tokens will always be shown regardless of network
 */
export const getMajorTokens = (): TokenInfo[] => {
  return MAJOR_TOKENS;
};

/**
 * Get major tokens by category
 */
export const getMajorTokensByCategory = (category: string): TokenInfo[] => {
  const categories: Record<string, string[]> = {
    'layer1': ['BTC', 'ETH', 'BNB', 'SOL', 'AVAX', 'DOT', 'ATOM', 'ADA'],
    'stablecoins': ['USDC', 'USDT', 'DAI'],
    'defi': ['LINK', 'UNI', 'AAVE', 'CRV', 'SUSHI', 'COMP', 'MKR'],
    'layer2': ['MATIC', 'ARB', 'OP'],
    'meme': ['APE', 'SHIB', 'DOGE'],
  };

  const symbols = categories[category] || [];
  return MAJOR_TOKENS.filter(token => symbols.includes(token.symbol));
};

/**
 * Get token by symbol from major tokens list
 */
export const getMajorTokenBySymbol = (symbol: string): TokenInfo | undefined => {
  return MAJOR_TOKENS.find(token => token.symbol.toUpperCase() === symbol.toUpperCase());
};

/**
 * Check if a token is a major token
 */
export const isMajorToken = (symbol: string): boolean => {
  return MAJOR_TOKENS.some(token => token.symbol.toUpperCase() === symbol.toUpperCase());
};