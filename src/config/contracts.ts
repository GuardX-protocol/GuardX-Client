import { getDeployment } from './deployments';
import { DEFAULT_CHAIN } from './chains';

/**
 * Get contracts for current chain
 * This function should be called with the active chain ID
 */
export const getContracts = (chainId?: number) => {
  const deployment = getDeployment(chainId || DEFAULT_CHAIN.id);
  
  if (!deployment) {
    console.warn(`No deployment found for chain ${chainId}, using default`);
    return getDeployment(DEFAULT_CHAIN.id)!.contracts;
  }
  
  return deployment.contracts;
};

/**
 * Get external contracts for current chain
 */
export const getExternalContracts = (chainId?: number) => {
  const deployment = getDeployment(chainId || DEFAULT_CHAIN.id);
  
  if (!deployment) {
    console.warn(`No deployment found for chain ${chainId}, using default`);
    return getDeployment(DEFAULT_CHAIN.id)!.externalContracts;
  }
  
  return deployment.externalContracts;
};

/**
 * Legacy exports for backward compatibility
 * These use the default chain
 */
export const CONTRACTS = getContracts();
export const EXTERNAL_CONTRACTS = getExternalContracts();

/**
 * Network configuration for backward compatibility
 */
export const NETWORK_CONFIG = {
  chainId: DEFAULT_CHAIN.id,
  network: DEFAULT_CHAIN.network || DEFAULT_CHAIN.name.toLowerCase(),
  deploymentTimestamp: new Date().toISOString(),
} as const;

export type ContractName = keyof ReturnType<typeof getContracts>;
export type ExternalContractName = keyof ReturnType<typeof getExternalContracts>;
