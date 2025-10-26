import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ERC20_ABI } from '@/config/abis/ERC20';
import { parseUnits } from 'viem';
import toast from 'react-hot-toast';

export const useTokenApproval = (
  tokenAddress: string,
  spenderAddress: string,
  amount: string,
  decimals: number = 18
) => {
  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = () => {
    if (!tokenAddress || !spenderAddress || !amount || parseFloat(amount) <= 0) {
      toast.error('Invalid approval parameters');
      return;
    }

    writeContract(
      {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [
          spenderAddress as `0x${string}`,
          parseUnits(amount, decimals),
        ],
      },
      {
        onSuccess: () => {
          toast.success('Token approval successful!');
        },
        onError: () => {
          toast.error('Token approval failed');
        },
      }
    );
  };

  return {
    approve,
    transaction: hash,
    isLoading: isPending || isConfirming,
    isSuccess,
  };
};
