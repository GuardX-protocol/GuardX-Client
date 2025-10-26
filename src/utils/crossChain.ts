/**
 * Cross-chain utilities for GuardX
 * Handles chain detection, bridging logic, and cross-chain operations
 */

// Chain IDs
export const CHAIN_IDS = {
  ETHEREUM_MAINNET: 1,
  ETHEREUM_SEPOLIA: 11155111,
  BASE_MAINNET: 8453,
  BASE_SEPOLIA: 84532,
  ARBITRUM_MAINNET: 42161,
  ARBITRUM_SEPOLIA: 421614,
  OPTIMISM_MAINNET: 10,
  OPTIMISM_SEPOLIA: 11155420,
} as const;

// Chain names mapping
const CHAIN_NAMES: Record<number, string> = {
  [CHAIN_IDS.ETHEREUM_MAINNET]: 'Ethereum',
  [CHAIN_IDS.ETHEREUM_SEPOLIA]: 'Ethereum Sepolia',
  [CHAIN_IDS.BASE_MAINNET]: 'Base',
  [CHAIN_IDS.BASE_SEPOLIA]: 'Base Sepolia',
  [CHAIN_IDS.ARBITRUM_MAINNET]: 'Arbitrum',
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: 'Arbitrum Sepolia',
  [CHAIN_IDS.OPTIMISM_MAINNET]: 'Optimism',
  [CHAIN_IDS.OPTIMISM_SEPOLIA]: 'Optimism Sepolia',
};

// Primary deployment chain (where GuardX contracts are deployed)
export const PRIMARY_CHAIN_ID = CHAIN_IDS.BASE_SEPOLIA;

/**
 * Get human-readable chain name
 */
export function getChainName(chainId: number): string {
  return CHAIN_NAMES[chainId] || `Chain ${chainId}`;
}

/**
 * Determine the target chain for a deposit
 * If the user is on a different chain than the primary deployment,
 * they'll need to bridge to the primary chain
 */
export function getTargetChainForDeposit(_currentChainId: number): number {
  // Always target the primary chain where GuardX is deployed
  return PRIMARY_CHAIN_ID;
}

/**
 * Check if a cross-chain operation is needed
 */
export function needsCrossChainOperation(
  currentChainId: number,
  targetChainId: number
): boolean {
  return currentChainId !== targetChainId;
}

/**
 * Estimate cross-chain transaction time
 */
export function estimateCrossChainTime(
  fromChainId: number,
  toChainId: number
): string {
  // Different bridge routes have different times
  const isL2toL2 = isL2Chain(fromChainId) && isL2Chain(toChainId);
  const isL1toL2 = isL1Chain(fromChainId) && isL2Chain(toChainId);
  const isL2toL1 = isL2Chain(fromChainId) && isL1Chain(toChainId);

  if (isL2toL2) {
    return '5-10 minutes';
  } else if (isL1toL2) {
    return '10-15 minutes';
  } else if (isL2toL1) {
    return '15-30 minutes'; // L2 to L1 can take longer due to challenge periods
  }

  return '10-20 minutes';
}

/**
 * Check if a chain is an L1 chain
 */
function isL1Chain(chainId: number): boolean {
  const l1Chains = [
    CHAIN_IDS.ETHEREUM_MAINNET,
    CHAIN_IDS.ETHEREUM_SEPOLIA,
  ];
  return l1Chains.includes(chainId as any);
}

/**
 * Check if a chain is an L2 chain
 */
function isL2Chain(chainId: number): boolean {
  const l2Chains = [
    CHAIN_IDS.BASE_MAINNET,
    CHAIN_IDS.BASE_SEPOLIA,
    CHAIN_IDS.ARBITRUM_MAINNET,
    CHAIN_IDS.ARBITRUM_SEPOLIA,
    CHAIN_IDS.OPTIMISM_MAINNET,
    CHAIN_IDS.OPTIMISM_SEPOLIA,
  ];
  return l2Chains.includes(chainId as any);
}

/**
 * Get supported chains for GuardX
 */
export function getSupportedChains(): number[] {
  return [
    CHAIN_IDS.BASE_SEPOLIA, // Primary
    CHAIN_IDS.ARBITRUM_SEPOLIA,
    CHAIN_IDS.ETHEREUM_SEPOLIA,
    CHAIN_IDS.OPTIMISM_SEPOLIA,
  ];
}

/**
 * Check if a chain is supported by GuardX
 */
export function isSupportedChain(chainId: number): boolean {
  return getSupportedChains().includes(chainId);
}

/**
 * Get bridge fee estimate (in USD)
 */
export function estimateBridgeFee(
  fromChainId: number,
  toChainId: number,
  _tokenAmount: bigint
): string {
  // Simplified fee estimation
  // In production, this would call the actual bridge API
  const isL2toL2 = isL2Chain(fromChainId) && isL2Chain(toChainId);
  
  if (isL2toL2) {
    return '$1-3';
  }
  
  return '$3-10';
}

/**
 * Get recommended bridge provider for a route
 */
export function getRecommendedBridge(
  _fromChainId: number,
  _toChainId: number
): string {
  // For now, we'll use Vincent's built-in bridging
  // In the future, this could route to different bridges based on the route
  return 'Vincent Bridge';
}
