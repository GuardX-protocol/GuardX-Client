import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { useCrashGuardCore } from './useContract';
import { parseUnits } from 'viem';

export const useProtectionPolicy = () => {
  const { address } = useAccount();
  const contract = useCrashGuardCore();

  const { data: policy, isLoading, refetch } = useReadContract({
    ...contract,
    functionName: 'getProtectionPolicy',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      gcTime: 1000 * 60 * 5, // renamed from cacheTime
    },
  });

  // Return empty policy structure if no data
  const emptyPolicy = {
    crashThreshold: BigInt(0),
    maxSlippage: BigInt(0),
    emergencyActions: [],
    stablecoinPreference: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    gasLimit: BigInt(0),
  };

  return {
    policy: policy || emptyPolicy,
    isLoading,
    refetch,
  };
};

export const useSetProtectionPolicy = (
  crashThreshold: number,
  maxSlippage: number,
  stablecoinAddress: string
) => {
  const contract = useCrashGuardCore();
  const { writeContract, data, isPending } = useWriteContract();

  const policyStruct = {
    crashThreshold: parseUnits(crashThreshold.toString(), 18),
    maxSlippage: parseUnits(maxSlippage.toString(), 18),
    emergencyActions: [] as `0x${string}`[],
    stablecoinPreference: stablecoinAddress as `0x${string}`,
    gasLimit: BigInt(500000), // Default gas limit
  };

  const write = () => {
    if (!stablecoinAddress || crashThreshold <= 0 || maxSlippage <= 0) {
      console.error('Invalid policy parameters');
      return;
    }

    writeContract({
      ...contract,
      functionName: 'setProtectionPolicy',
      args: [policyStruct],
    });
  };

  return {
    write,
    data,
    isLoading: isPending,
  };
};
