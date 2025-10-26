import { DEPLOYMENTS, getDeployment } from '@/config/deployments';

/**
 * Get the primary deployment chain for GuardX contracts
 * Currently Base Sepolia (84532) is the primary chain
 */
export const getPrimaryChain = (): number => {
  return 84532; // Base Sepolia
};

/**
 * Check if a chain has GuardX contracts deployed
 */
export const hasGuardXContracts = (chainId: number): boolean => {
  const deployment = getDeployment(chainId);
  if (!deployment) return false;
  
  // Check if CrashGuardCore is deployed (main contract)
  return deployment.contracts.CrashGuardCore !== '0x0000000000000000000000000000000000000000';
};

/**
 * Get the best target chain for deposits
 * If current chain has contracts, use it. Otherwise, use primary chain.
 */
export const getTargetChainForDeposit = (currentChain?: number): number => {
  if (currentChain && hasGuardXContracts(currentChain)) {
    return currentChain;
  }
  return getPrimaryChain();
};

/**
 * Check if cross-chain operation is needed
 */
export const needsCrossChainOperation = (fromChain: number, toChain: number): boolean => {
  return fromChain !== toChain;
};

/**
 * Get supported chains for cross-chain operations
 */
export const getSupportedChainsForCrossChain = (): number[] => {
  return Object.keys(DEPLOYMENTS)
    .map(Number)
    .filter(chainId => hasGuardXContracts(chainId));
};

/**
 * Get chain name for display
 */
export const getChainName = (chainId: number): string => {
  const chainNames: Record<number, string> = {
    1: 'Ethereum',
    10: 'Optimism',
    137: 'Polygon',
    8453: 'Base',
    42161: 'Arbitrum',
    84532: 'Base Sepolia',
    421614: 'Arbitrum Sepolia',
  };
  
  return chainNames[chainId] || `Chain ${chainId}`;
};

/**
 * Estimate cross-chain operation time
 */
export const estimateCrossChainTime = (fromChain: number, toChain: number): string => {
  if (fromChain === toChain) return '~30 seconds';
  
  // Cross-chain operations typically take longer
  return '~2-5 minutes';
};

/**
 * Get cross-chain fee estimate
 */
export const estimateCrossChainFee = (fromChain: number, toChain: number): string => {
  if (fromChain === toChain) return '$2-5';
  
  // Cross-chain operations have additional fees
  return '$10-20';
};