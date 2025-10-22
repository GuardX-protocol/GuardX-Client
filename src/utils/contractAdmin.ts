// Contract interaction utilities for token management

/**
 * Common token addresses for different networks
 */
export const COMMON_TOKENS: Record<number, Record<string, string>> = {
  // Arbitrum Sepolia testnet tokens
  421614: {
    USDC: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // The token from the error
    WETH: '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73',
    USDT: '0xfd064A18f3BF249cf1f87FC203E90D8f650f2d63',
    LINK: '0xb1D4538B4571d411F07960EF2838Ce337FE1E80E',
    UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  },
  // Base Sepolia testnet tokens  
  84532: {
    USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    WETH: '0x4200000000000000000000000000000000000006',
    LINK: '0xE4aB69C077896252FAFBD49EFD26B5D171A32410',
    UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  },
  // Ethereum Mainnet (for reference)
  1: {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  },
};

/**
 * Get common tokens for a chain
 */
export const getCommonTokensForChain = (chainId?: number): Record<string, string> => {
  if (!chainId || !(chainId in COMMON_TOKENS)) {
    return {};
  }
  return COMMON_TOKENS[chainId];
};

/**
 * Contract interaction helpers for adding supported tokens
 * Note: These require owner privileges on the contract
 */
export const getAddTokenCalldata = (tokenAddress: string) => {
  return {
    address: tokenAddress,
    functionName: 'addSupportedToken',
    args: [tokenAddress],
  };
};

/**
 * Batch add multiple tokens (for contract owner)
 */
export const getBatchAddTokensCalldata = (tokenAddresses: string[]) => {
  return tokenAddresses.map(address => getAddTokenCalldata(address));
};

/**
 * Log token support information for debugging
 */
export const logTokenSupportInfo = (chainId?: number, contractAddress?: string) => {
  const commonTokens = getCommonTokensForChain(chainId);
  
  console.log('🔧 Token Support Debug Info:', {
    chainId,
    contractAddress,
    commonTokens,
    timestamp: new Date().toISOString(),
    note: 'These tokens need to be added by contract owner using addSupportedToken()',
  });

  // Log the specific calls needed
  Object.entries(commonTokens).forEach(([symbol, address]) => {
    console.log(`📝 To add ${symbol}:`, {
      function: 'addSupportedToken',
      args: [address],
      calldata: getAddTokenCalldata(address as string),
    });
  });
};

/**
 * Check if we're dealing with a known token that should be supported
 */
export const isKnownToken = (tokenAddress: string, chainId?: number): { symbol?: string; shouldBeSupported: boolean } => {
  const commonTokens = getCommonTokensForChain(chainId);
  
  for (const [symbol, address] of Object.entries(commonTokens)) {
    if ((address as string).toLowerCase() === tokenAddress.toLowerCase()) {
      return { symbol, shouldBeSupported: true };
    }
  }
  
  return { shouldBeSupported: false };
};