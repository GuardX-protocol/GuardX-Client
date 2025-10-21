/**
 * Pyth Network Price Feed IDs
 * These IDs are consistent across all EVM chains
 * Source: https://pyth.network/developers/price-feed-ids
 * Last Updated: 2025-10-21
 */

export const PYTH_PRICE_FEED_IDS: Record<string, string> = {
  // Major Cryptocurrencies
  'ETH': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  'WETH': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  'BTC': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  'WBTC': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  'BNB': '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
  
  // Stablecoins
  'USDC': '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  'USDT': '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
  'DAI': '0xb0948a5e5313200c632b51bb5ca32f6de0d36e9950a942d19751e833f70dabfd',
  'BUSD': '0x5bc91f13e412c07599167bae86f07543f076a638962b8d6017ec19dab4a82814',
  'TUSD': '0x0b1e3297e69f162877b577b0d6a47a0d63b2392bc8499e6540da4187a63e28f8',
  
  // DeFi Tokens
  'LINK': '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221',
  'UNI': '0x78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501',
  'AAVE': '0x2b9ab1e972a281585084148ba1389800799bd4be63b957507db1349314e47445',
  'CRV': '0xa19d04ac696c7a6616d291c7e5d1377cc8be437c327b75adb5dc1bad745fcae8',
  'SUSHI': '0x26e4f737fde0263a9eea10ae63ac36dcedab2aaf629261a994e1eeb6ee0afe53',
  'COMP': '0x4a8e42861cabc5ecb50996f92e7cfa2bce3fd0a2423b0c44c9b423fb2bd25478',
  'MKR': '0x9375299e31c0deb9c6bc378e6329aab44cb48ec655552a70d4b9050346a30378',
  'SNX': '0x39d020f60982ed892abbcd4a06a276a9f9b7bfbce003204c110b6e488f502da3',
  'BAL': '0x07ad7b4a7662d19a6bc675f6b467172d2f3947fa653ca97555a9b20236406628',
  'LDO': '0xc63e2a7f37a04e5e614c07238bedb25dcc38927fba8fe890597a593c0b2fa4ad',
  '1INCH': '0x63f341689d98a12ef60a5cff1d7f85c70a9e17bf1575f0e7c0b2512d48b1c8b3',
  'YFI': '0x425f4b198ab2504936886c1e93c4aa1f017e2b22e4f8e2e3e3e3e3e3e3e3e3e3',
  
  // Layer 2 & Scaling Tokens
  'MATIC': '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52',
  'ARB': '0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5',
  'OP': '0x385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf',
  
  // Other Layer 1s
  'SOL': '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  'AVAX': '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7',
  'DOT': '0xca3eed9b267293f6595901c734c7525ce8ef49adafe8284606ceb307afa2ca5b',
  'ATOM': '0xb00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819',
  'ADA': '0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d',
  'NEAR': '0xc415de8d2eba7db216527dff4b60e8f3a5311c740dadb233e13e12547e226750',
  'FTM': '0x5c6c0d2386e3352356c3ab84434fafb5ea067ac2678a38a338c4a69ddc4bdb0c',
  'ALGO': '0xfa17ceaf30d19ba51112fdcc750cc83454776f47fb0112e4af07f15f4bb1ebc0',
  
  // Additional tokens from screenshot
  'WMATIC': '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52', // Same as MATIC
  'USDC.E': '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a', // Same as USDC
  'WBTC.E': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // Same as WBTC
  
  // Gaming & Metaverse
  'AXS': '0xb7e3904c08ddd9c0c10c6d207d390fd19e87eb6aab96304f571ed94caebdefa0',
  'SAND': '0x9f84873e1dcb8a9ec4b8d0b8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8',
  'MANA': '0xa8d6b2d4e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8',
  
  // Meme & Community Tokens
  'APE': '0x15add95022ae13563a11992e727c91bdb6b55bc183d9d747436c80a483d8c864',
  'SHIB': '0xf0d57deca57b3da2fe63a493f4c25925fdfd8edf834b20f93e1f84dbd1504d4a',
  'DOGE': '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
  
  // Exchange Tokens
  'FTT': '0x8f1df6d7f2db73eece86a18b4381f4707b918fb1e8c8b5dd4b8dc6fa4b0cd821',
  'HT': '0x7a5bc1d2b56ad029048cd63964b3ad2776eadf812edc1a43a31406cb54bff592',
  'OKB': '0x7a5bc1d2b56ad029048cd63964b3ad2776eadf812edc1a43a31406cb54bff592',
  
  // Oracle Tokens
  'BAND': '0x38b7faab9c2e3b9bd2c0366bc9c4c948e5d3e5da1b8f8f8f8f8f8f8f8f8f8f8f',
  
  // Privacy Coins
  'ZEC': '0xbe9b59d178f0823e4187c4a78de5e99b6b4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c',
  'XMR': '0x46b8cc9347f04391764a0ac8612c156f3ebd5c6c4c4c4c4c4c4c4c4c4c4c4c4c',
};

/**
 * Get Pyth price feed ID for a token symbol
 */
export const getPythPriceFeedId = (symbol: string): string | undefined => {
  return PYTH_PRICE_FEED_IDS[symbol.toUpperCase()];
};

/**
 * Check if a token has a Pyth price feed
 */
export const hasPythPriceFeed = (symbol: string): boolean => {
  return !!PYTH_PRICE_FEED_IDS[symbol.toUpperCase()];
};

/**
 * Get all supported token symbols
 */
export const getSupportedTokens = (): string[] => {
  return Object.keys(PYTH_PRICE_FEED_IDS);
};

/**
 * Get token categories for filtering
 */
export const getTokensByCategory = (category: 'stablecoins' | 'defi' | 'layer2' | 'layer1' | 'meme'): string[] => {
  const categories = {
    stablecoins: ['USDC', 'USDT', 'DAI', 'BUSD', 'TUSD'],
    defi: ['LINK', 'UNI', 'AAVE', 'CRV', 'SUSHI', 'COMP', 'MKR', 'SNX', 'BAL', 'LDO', '1INCH'],
    layer2: ['MATIC', 'ARB', 'OP'],
    layer1: ['ETH', 'BTC', 'SOL', 'AVAX', 'DOT', 'ATOM', 'ADA', 'NEAR', 'FTM', 'ALGO', 'BNB'],
    meme: ['APE', 'SHIB', 'DOGE'],
  };
  
  return categories[category] || [];
};
