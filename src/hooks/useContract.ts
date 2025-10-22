import { useState, useEffect, useMemo } from 'react';
import { useContractRead } from 'wagmi';
import { useNetwork } from 'wagmi';
import { getContracts } from '@/config/contracts';
import { CrashGuardCoreABI } from '@/config/abis';
import toast from 'react-hot-toast';

export const useCrashGuardCore = () => {
  const { chain } = useNetwork();
  const contracts = getContracts(chain?.id);

  return useMemo(() => ({
    address: contracts.CrashGuardCore as `0x${string}`,
    abi: CrashGuardCoreABI,
  }), [contracts.CrashGuardCore]);
};

export const useEmergencyExecutor = () => {
  const { chain } = useNetwork();
  const contracts = getContracts(chain?.id);
  const { EmergencyExecutorABI } = require('@/config/abis');

  return useMemo(() => ({
    address: contracts.EmergencyExecutor as `0x${string}`,
    abi: EmergencyExecutorABI,
  }), [contracts.EmergencyExecutor]);
};

export const usePythPriceMonitor = () => {
  const { chain } = useNetwork();
  const contracts = getContracts(chain?.id);
  const { PythPriceMonitorABI } = require('@/config/abis');

  return useMemo(() => ({
    address: contracts.PythPriceMonitor as `0x${string}`,
    abi: PythPriceMonitorABI,
  }), [contracts.PythPriceMonitor]);
};

export const useDEXAggregator = () => {
  const { chain } = useNetwork();
  const contracts = getContracts(chain?.id);
  const { DEXAggregatorABI } = require('@/config/abis');

  return useMemo(() => ({
    address: contracts.DEXAggregator as `0x${string}`,
    abi: DEXAggregatorABI,
  }), [contracts.DEXAggregator]);
};

export const usePortfolioRebalancer = () => {
  const { chain } = useNetwork();
  const contracts = getContracts(chain?.id);
  const { PortfolioRebalancerABI } = require('@/config/abis');

  return useMemo(() => ({
    address: contracts.PortfolioRebalancer as `0x${string}`,
    abi: PortfolioRebalancerABI,
  }), [contracts.PortfolioRebalancer]);
};

export const useDeposit = () => {
  const { chain } = useNetwork();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const depositToken = async (tokenAddress: string, amount: string, decimals: number) => {
    if (!chain?.id) return;

    setIsLoading(true);
    toast.loading('Processing deposit...', { id: 'deposit' });

    try {
      const { contractService } = await import('@/services/contractService');
      const hash = await contractService.depositAsset(tokenAddress, amount, decimals, chain.id);

      setTxHash(hash);
      toast.dismiss('deposit');
      toast.success('Deposit successful! 🎉');
    } catch (error: any) {
      toast.dismiss('deposit');
      toast.error(`Deposit failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { depositToken, isLoading, txHash };
};

export const useWithdraw = () => {
  const { chain } = useNetwork();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const withdrawToken = async (tokenAddress: string, amount: string, decimals: number) => {
    if (!chain?.id) return;

    setIsLoading(true);
    toast.loading('Processing withdrawal...', { id: 'withdraw' });

    try {
      const { contractService } = await import('@/services/contractService');
      const hash = await contractService.withdrawAsset(tokenAddress, amount, decimals, chain.id);

      setTxHash(hash);
      toast.dismiss('withdraw');
      toast.success('Withdrawal successful! 💰');
    } catch (error: any) {
      toast.dismiss('withdraw');
      toast.error(`Withdrawal failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { withdrawToken, isLoading, txHash };
};

export const usePortfolioData = (userAddress?: string) => {
  const { chain } = useNetwork();
  const contracts = getContracts(chain?.id);

  const { data: portfolio, isLoading, refetch } = useContractRead({
    address: contracts.CrashGuardCore as `0x${string}`,
    abi: CrashGuardCoreABI,
    functionName: 'getPortfolio' as any,
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    enabled: !!userAddress,
    watch: false,
  });

  return { portfolio, isLoading, refetch };
};

export const usePolicyData = (userAddress?: string) => {
  const { chain } = useNetwork();
  const contracts = getContracts(chain?.id);

  const { data: policy, isLoading, refetch } = useContractRead({
    address: contracts.CrashGuardCore as `0x${string}`,
    abi: CrashGuardCoreABI,
    functionName: 'getProtectionPolicy',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    enabled: !!userAddress,
    watch: false,
  });

  return { policy, isLoading, refetch };
};