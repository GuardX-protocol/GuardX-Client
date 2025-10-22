import { useContractRead, useAccount } from 'wagmi';
import { ERC20_ABI } from '@/config/abis/ERC20';
import { formatTokenAmount } from '@/utils/format';

export const useTokenBalance = (tokenAddress: string, decimals: number = 18) => {
  const { address } = useAccount();

  // Validate token address format
  const isValidAddress = Boolean(tokenAddress && 
    tokenAddress.startsWith('0x') && 
    tokenAddress.length === 42 &&
    /^0x[a-fA-F0-9]{40}$/.test(tokenAddress) &&
    tokenAddress !== '0x0000000000000000000000000000000000000000');

  const { data: balance, isLoading, refetch, isError } = useContractRead({
    address: isValidAddress ? (tokenAddress as `0x${string}`) : undefined,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address && isValidAddress,
    watch: false,
    cacheTime: 1000 * 30,
    staleTime: 1000 * 10,
    // retry: false, // Don't retry failed calls
    onError: (error) => {
      // Silently handle expected errors for non-existent tokens
      const errorMessage = error.message.toLowerCase();
      if (!errorMessage.includes('returned no data') && 
          !errorMessage.includes('call revert') &&
          !errorMessage.includes('execution reverted') &&
          !errorMessage.includes('contract function') &&
          !errorMessage.includes('does not have the function')) {
        console.debug(`Balance fetch failed for ${tokenAddress}:`, error.message);
      }
    },
  });

  const formattedBalance = balance ? formatTokenAmount(balance as bigint, decimals) : '0.00';

  return {
    balance: balance as bigint | undefined,
    formattedBalance,
    isLoading,
    isError,
    refetch,
    hasValidAddress: isValidAddress,
  };
};

export const useTokenAllowance = (
  tokenAddress: string,
  spenderAddress: string
) => {
  const { address } = useAccount();

  // Validate addresses
  const isValidTokenAddress = Boolean(tokenAddress && tokenAddress.startsWith('0x') && tokenAddress.length === 42);
  const isValidSpenderAddress = Boolean(spenderAddress && spenderAddress.startsWith('0x') && spenderAddress.length === 42);

  const { data: allowance, isLoading, refetch, isError } = useContractRead({
    address: isValidTokenAddress ? (tokenAddress as `0x${string}`) : undefined,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && isValidSpenderAddress ? [address, spenderAddress as `0x${string}`] : undefined,
    enabled: !!address && isValidTokenAddress && isValidSpenderAddress,
    watch: false, // Changed to false for better performance
    cacheTime: 1000 * 30,
    staleTime: 1000 * 10,
    onError: (error) => {
      if (!error.message.includes('returned no data') && !error.message.includes('call revert exception')) {
        console.warn(`Allowance fetch error for ${tokenAddress}:`, error.message);
      }
    },
  });

  return {
    allowance: (allowance as bigint) || BigInt(0),
    isLoading,
    isError,
    refetch,
  };
};
