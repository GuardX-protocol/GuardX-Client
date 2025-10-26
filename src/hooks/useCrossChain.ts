import { useReadContract, useAccount, useChainId } from 'wagmi';
import { getContracts } from '@/config/contracts';
import { DEFAULT_CHAIN } from '@/config/chains';
import {
  CrossChainManagerABI,
  CrossChainEmergencyCoordinatorABI,
  LitProtocolIntegrationABI,
} from '@/config/abis';

// Cross Chain Manager Hook
export const useCrossChainManager = () => {
  const chainId = useChainId();
  const contracts = getContracts(chainId || DEFAULT_CHAIN.id);
  
  return {
    address: contracts.CrossChainManager as `0x${string}`,
    abi: CrossChainManagerABI,
  };
};

// Cross Chain Emergency Coordinator Hook
export const useCrossChainEmergencyCoordinator = () => {
  const chainId = useChainId();
  const contracts = getContracts(chainId || DEFAULT_CHAIN.id);
  
  return {
    address: contracts.CrossChainEmergencyCoordinator as `0x${string}`,
    abi: CrossChainEmergencyCoordinatorABI,
  };
};

// Lit Protocol Integration Hook
export const useLitProtocolIntegration = () => {
  const chainId = useChainId();
  const contracts = getContracts(chainId || DEFAULT_CHAIN.id);
  
  return {
    address: contracts.LitProtocolIntegration as `0x${string}`,
    abi: LitProtocolIntegrationABI,
  };
};

// Get user's cross-chain assets
export const useCrossChainAssets = () => {
  const { address } = useAccount();
  const contract = useCrossChainManager();

  // Note: getUserCrossChainAssets function not available in current ABI
  // Providing fallback data structure
  const data = null;
  const isLoading = false;
  const refetch = () => Promise.resolve();

  return {
    assets: data,
    isLoading,
    refetch,
  };
};

// Get cross-chain emergency status
export const useCrossChainEmergencyStatus = () => {
  const { address } = useAccount();
  const contract = useCrossChainEmergencyCoordinator();

  // Note: getCrossChainEmergencyStatus function not available in current ABI
  // Providing fallback data structure
  const data = null;
  const isLoading = false;
  const refetch = () => Promise.resolve();

  return {
    status: data,
    isLoading,
    refetch,
  };
};

// Check if PKP is authorized
export const usePKPAuthorization = () => {
  const { address } = useAccount();
  const contract = useLitProtocolIntegration();

  const { data: isAuthorized, isLoading, refetch } = useReadContract({
    ...contract,
    functionName: 'isPKPAuthorized',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    isAuthorized: isAuthorized as boolean | undefined,
    isLoading,
    refetch,
  };
};