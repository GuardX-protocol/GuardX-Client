import { useNetwork } from 'wagmi';
import { useMemo } from 'react';
import { getContracts, getExternalContracts } from '@/config/contracts';
import { getDeployment, isChainDeployed } from '@/config/deployments';
import { DEFAULT_CHAIN } from '@/config/chains';

/**
 * Hook to get contracts for the current chain
 * Automatically switches contract addresses based on connected network
 */
export const useChainContracts = () => {
  const { chain } = useNetwork();
  const chainId = chain?.id || DEFAULT_CHAIN.id;

  const contracts = useMemo(() => getContracts(chainId), [chainId]);
  const externalContracts = useMemo(() => getExternalContracts(chainId), [chainId]);
  const deployment = useMemo(() => getDeployment(chainId), [chainId]);
  const isDeployed = useMemo(() => isChainDeployed(chainId), [chainId]);

  return {
    contracts,
    externalContracts,
    deployment,
    isDeployed,
    chainId,
    isSupported: !!deployment,
  };
};

/**
 * Hook to get a specific contract address for the current chain
 */
export const useContractAddress = (contractName: keyof ReturnType<typeof getContracts>) => {
  const { contracts, isDeployed } = useChainContracts();
  
  return {
    address: contracts[contractName] as `0x${string}`,
    isDeployed,
  };
};
