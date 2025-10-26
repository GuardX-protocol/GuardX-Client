import { useWriteContract, useSimulateContract, useWaitForTransactionReceipt } from 'wagmi';
import { ERC20_ABI } from '@/config/abis/ERC20';
import { parseUnits } from 'viem';
import toast from 'react-hot-toast';

export const useTokenApproval = (
  tokenAddress: string,
  spenderAddress: string,
  amount: string,
  decimals: number = 18
) => {
  const { config } = usePrepareContractWrite({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [
      spenderAddress as `0x${string}`,
      amount ? parseUnits(amount, decimals) : BigInt(0),
    ],
    query: {
      enabled: !!tokenAddress && !!spenderAddress && !!amount && parseFloat(amount) > 0,
    },
  });

  const { write, data, isLoading } = useContractWrite(config);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => {
      toast.success('Token approval successful!');
    },
    onError: () => {
      toast.error('Token approval failed');
    },
  });

  return {
    approve: write,
    transaction: data,
    isLoading: isLoading || isConfirming,
    isSuccess,
  };
};
