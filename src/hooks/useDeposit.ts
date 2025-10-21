import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import { useCrashGuardCore } from './useContract';
import { parseUnits } from 'viem';

export const useDeposit = (tokenAddress: string, amount: string, decimals: number = 18) => {
  const contract = useCrashGuardCore();

  const { config } = usePrepareContractWrite({
    ...contract,
    functionName: 'depositAsset',
    args: [
      tokenAddress as `0x${string}`,
      parseUnits(amount || '0', decimals),
    ],
    enabled: !!tokenAddress && !!amount && parseFloat(amount) > 0,
  });

  const { write, data, isLoading, isSuccess, isError, error } = useContractWrite(config);

  return {
    deposit: write,
    transaction: data,
    isLoading,
    isSuccess,
    isError,
    error,
  };
};

export const useWithdraw = (tokenAddress: string, amount: string, decimals: number = 18) => {
  const contract = useCrashGuardCore();

  const { config } = usePrepareContractWrite({
    ...contract,
    functionName: 'withdrawAsset',
    args: [
      tokenAddress as `0x${string}`,
      parseUnits(amount || '0', decimals),
    ],
    enabled: !!tokenAddress && !!amount && parseFloat(amount) > 0,
  });

  const { write, data, isLoading, isSuccess, isError, error } = useContractWrite(config);

  return {
    withdraw: write,
    transaction: data,
    isLoading,
    isSuccess,
    isError,
    error,
  };
};
