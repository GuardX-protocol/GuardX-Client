import { useNetwork } from 'wagmi';
import { getContracts } from '@/config/contracts';
import { DEFAULT_CHAIN } from '@/config/chains';
import {
  CrashGuardCoreABI,
  PythPriceMonitorABI,
  EmergencyExecutorABI,
  PortfolioRebalancerABI,
} from '@/config/abis';

/**
 * Chain-aware contract hooks
 * Automatically use the correct contract address based on connected network
 */

export const useCrashGuardCore = () => {
  const { chain } = useNetwork();
  const contracts = getContracts(chain?.id || DEFAULT_CHAIN.id);
  
  return {
    address: contracts.CrashGuardCore as `0x${string}`,
    abi: CrashGuardCoreABI,
  };
};

export const usePythPriceMonitor = () => {
  const { chain } = useNetwork();
  const contracts = getContracts(chain?.id || DEFAULT_CHAIN.id);
  
  return {
    address: contracts.PythPriceMonitor as `0x${string}`,
    abi: PythPriceMonitorABI,
  };
};

export const useEmergencyExecutor = () => {
  const { chain } = useNetwork();
  const contracts = getContracts(chain?.id || DEFAULT_CHAIN.id);
  
  return {
    address: contracts.EmergencyExecutor as `0x${string}`,
    abi: EmergencyExecutorABI,
  };
};

export const usePortfolioRebalancer = () => {
  const { chain } = useNetwork();
  const contracts = getContracts(chain?.id || DEFAULT_CHAIN.id);
  
  return {
    address: contracts.PortfolioRebalancer as `0x${string}`,
    abi: PortfolioRebalancerABI,
  };
};
