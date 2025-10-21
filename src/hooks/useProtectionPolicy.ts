import { useContractRead, useContractWrite, usePrepareContractWrite, useAccount } from 'wagmi';
import { useCrashGuardCore } from './useContract';
import { parseUnits } from 'viem';

export const useProtectionPolicy = () => {
  const { address } = useAccount();
  const contract = useCrashGuardCore();

  const { data: policy, isLoading, refetch } = useContractRead({
    ...contract,
    functionName: 'getProtectionPolicy',
    args: address ? [address] : undefined,
    enabled: !!address,
    watch: false,
    cacheTime: 1000 * 60 * 5,
    onError: (error) => {
      // Suppress error if it's just empty data (no policy yet)
      if (error.message.includes('returned no data') || error.message.includes('0x')) {
        console.log('No protection policy set yet for user');
      } else {
        console.error('Error fetching protection policy:', error);
      }
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

  const policyStruct = {
    crashThreshold: parseUnits(crashThreshold.toString(), 18),
    maxSlippage: parseUnits(maxSlippage.toString(), 18),
    emergencyActions: [] as `0x${string}`[],
    stablecoinPreference: stablecoinAddress as `0x${string}`,
    gasLimit: BigInt(500000), // Default gas limit
  };

  const { config } = usePrepareContractWrite({
    ...contract,
    functionName: 'setProtectionPolicy',
    args: [policyStruct],
    enabled: !!stablecoinAddress && crashThreshold > 0 && maxSlippage > 0,
  });

  const { write, data, isLoading } = useContractWrite(config);

  return {
    write,
    data,
    isLoading,
    config,
  };
};
