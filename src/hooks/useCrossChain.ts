import { useContractRead, useAccount, useNetwork } from 'wagmi';
import { getContracts } from '@/config/contracts';
import { DEFAULT_CHAIN } from '@/config/chains';
import {
  CrossChainManagerABI,
  CrossChainEmergencyCoordinatorABI,
  LitProtocolIntegrationABI,
} from '@/config/abis';

// Cross Chain Manager Hook
export const useCrossChainManager = () => {
  const { chain } = useNetwork();
  const contracts = getContracts(chain?.id || DEFAULT_CHAIN.id);
  
  return {
    address: contracts.CrossChainManager as `0x${string}`,
    abi: CrossChainManagerABI,
  };
};

// Cross Chain Emergency Coordinator Hook
export const useCrossChainEmergencyCoordinator = () => {
  const { chain } = useNetwork();
  const contracts = getContracts(chain?.id || DEFAULT_CHAIN.id);
  
  return {
    address: contracts.CrossChainEmergencyCoordinator as `0x${string}`,
    abi: CrossChainEmergencyCoordinatorABI,
  };
};

// Lit Protocol Integration Hook
export const useLitProtocolIntegration = () => {
  const { chain } = useNetwork();
  const contracts = getContracts(chain?.id || DEFAULT_CHAIN.id);
  
  return {
    address: contracts.LitProtocolIntegration as `0x${string}`,
    abi: LitProtocolIntegrationABI,
  };
};

// Get user's cross-chain assets
export const useCrossChainAssets = () => {
  const { address } = useAccount();
  const contract = useCrossChainManager();

  const { data, isLoading, refetch } = useContractRead({
    ...contract,
    functionName: 'getUserCrossChainAssets' as any,
    args: address ? [address] : undefined,
    enabled: !!address,
    watch: false,
    cacheTime: 1000 * 60 * 5,
    onError: (error) => {
      if (error.message.includes('returned no data')) {
        console.log('No cross-chain assets yet');
      }
    },
  });

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

  const { data, isLoading, refetch } = useContractRead({
    ...contract,
    functionName: 'getCrossChainEmergencyStatus' as any,
    args: address ? [address] : undefined,
    enabled: !!address,
    watch: false,
    cacheTime: 1000 * 60 * 5,
    onError: (error) => {
      if (error.message.includes('returned no data')) {
        console.log('No cross-chain emergency status');
      }
    },
  });

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

  const { data: isAuthorized, isLoading, refetch } = useContractRead({
    ...contract,
    functionName: 'isPKPAuthorized' as any,
    args: address ? [address] : undefined,
    enabled: !!address,
    watch: false,
    cacheTime: 1000 * 60 * 5,
  });

  return {
    isAuthorized: isAuthorized as boolean | undefined,
    isLoading,
    refetch,
  };
};
