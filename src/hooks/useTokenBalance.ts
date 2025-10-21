import { useContractRead, useAccount } from 'wagmi';
import { ERC20_ABI } from '@/config/abis/ERC20';
import { formatTokenAmount } from '@/config/tokens';

export const useTokenBalance = (tokenAddress: string, decimals: number = 18) => {
  const { address } = useAccount();

  const { data: balance, isLoading, refetch } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address && !!tokenAddress,
    watch: false,
    cacheTime: 1000 * 60 * 5,
    onError: (error) => {
      // Suppress errors for tokens that don't exist on this network
      if (error.message.includes('returned no data')) {
        console.log(`Token ${tokenAddress} not available on this network`);
      }
    },
  });

  const formattedBalance = balance ? formatTokenAmount(balance as bigint, decimals) : '0';

  return {
    balance: balance as bigint | undefined,
    formattedBalance,
    isLoading,
    refetch,
  };
};

export const useTokenAllowance = (
  tokenAddress: string,
  spenderAddress: string
) => {
  const { address } = useAccount();

  const { data: allowance, isLoading, refetch } = useContractRead({
    address: tokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && spenderAddress ? [address, spenderAddress as `0x${string}`] : undefined,
    enabled: !!address && !!tokenAddress && !!spenderAddress,
    watch: true,
  });

  return {
    allowance: allowance as bigint | undefined,
    isLoading,
    refetch,
  };
};
