import { useContractReads } from 'wagmi';
import { useMemo } from 'react';
import { CONTRACTS } from '@/config/contracts';
import { PythPriceMonitorABI } from '@/config/abis';

// Pyth price feed IDs for common tokens
// Source: https://pyth.network/developers/price-feed-ids
const PYTH_PRICE_IDS: Record<string, string> = {
  // Crypto
  'ETH': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  'WETH': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  'BTC': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  'WBTC': '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  'USDC': '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  'USDT': '0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b',
  'DAI': '0xb0948a5e5313200c632b51bb5ca32f6de0d36e9950a942d19751e833f70dabfd',
  'BNB': '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
  'SOL': '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  'MATIC': '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52',
  'AVAX': '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7',
  'LINK': '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221',
  'UNI': '0x78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501',
  'AAVE': '0x2b9ab1e972a281585084148ba1389800799bd4be63b957507db1349314e47445',
  'CRV': '0xa19d04ac696c7a6616d291c7e5d1377cc8be437c327b75adb5dc1bad745fcae8',
  'MKR': '0x9375299e31c0deb9c6bc378e6329aab44cb48ec655552a70d4b9050346a30378',
  'COMP': '0x4a8e42861cabc5ecb50996f92e7cfa2bce3fd0a2423b0c44c9b423fb2bd25478',
  'SNX': '0x39d020f60982ed892abbcd4a06a276a9f9b7bfbce003204c110b6e488f502da3',
  'SUSHI': '0x26e4f737fde0263a9eea10ae63ac36dcedab2aaf629261a994e1eeb6ee0afe53',
  'DOT': '0xca3eed9b267293f6595901c734c7525ce8ef49adafe8284606ceb307afa2ca5b',
  'ADA': '0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d',
  'ATOM': '0xb00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819',
  'FTM': '0x5c6c0d2386e3352356c3ab84434fafb5ea067ac2678a38a338c4a69ddc4bdb0c',
  'NEAR': '0xc415de8d2eba7db216527dff4b60e8f3a5311c740dadb233e13e12547e226750',
  'APE': '0x15add95022ae13563a11992e727c91bdb6b55bc183d9d747436c80a483d8c864',
  'LDO': '0xc63e2a7f37a04e5e614c07238bedb25dcc38927fba8fe890597a593c0b2fa4ad',
  'ARB': '0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5',
  'OP': '0x385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf',
};

interface PriceData {
  price: bigint;
  confidence: bigint;
  expo: number;
  publishTime: bigint;
  formattedPrice: string;
}

/**
 * Optimized hook to fetch multiple token prices in a single batch call
 * Time Complexity: O(1) - Single contract call regardless of token count
 * Space Complexity: O(n) where n is number of tokens
 */
export const usePythPriceMultiple = (symbols: string[]) => {
  // Prepare contract calls for all tokens
  // Time Complexity: O(n) where n is number of symbols
  const contracts = useMemo(() => {
    return symbols
      .filter(symbol => PYTH_PRICE_IDS[symbol.toUpperCase()])
      .map(symbol => ({
        address: CONTRACTS.PythPriceMonitor as `0x${string}`,
        abi: PythPriceMonitorABI,
        functionName: 'getPrice',
        args: [PYTH_PRICE_IDS[symbol.toUpperCase()]],
      }));
  }, [symbols]);

  // Batch read all prices in a single call
  // Time Complexity: O(1) - Single RPC call
  const { data, isLoading, isError, refetch } = useContractReads({
    contracts,
    watch: false,
    cacheTime: 30000, // Cache for 30 seconds
  });

  // Process results into a map for O(1) lookup
  // Time Complexity: O(n)
  // Space Complexity: O(n)
  const priceMap = useMemo(() => {
    const map = new Map<string, PriceData>();
    
    if (!data) return map;

    symbols.forEach((symbol, index) => {
      const result = data[index];
      if (result?.status === 'success' && result.result) {
        const [price, confidence, expo, publishTime] = result.result as [bigint, bigint, number, bigint];
        
        // Format price with proper decimals
        const formattedPrice = (Number(price) / Math.pow(10, Math.abs(expo))).toFixed(2);
        
        map.set(symbol.toUpperCase(), {
          price,
          confidence,
          expo,
          publishTime,
          formattedPrice,
        });
      }
    });

    return map;
  }, [data, symbols]);

  return {
    priceMap,
    isLoading,
    isError,
    refetch,
  };
};

/**
 * Get Pyth price feed ID for a token symbol
 */
export const getPythPriceId = (symbol: string): string | undefined => {
  return PYTH_PRICE_IDS[symbol.toUpperCase()];
};

/**
 * Check if a token has Pyth price feed
 */
export const hasPythPriceFeed = (symbol: string): boolean => {
  return symbol.toUpperCase() in PYTH_PRICE_IDS;
};
