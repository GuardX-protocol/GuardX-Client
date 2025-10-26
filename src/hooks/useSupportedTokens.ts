import { useReadContract, useReadContracts } from 'wagmi';
import { useChainId } from 'wagmi';
import { useMemo } from 'react';
import { getContracts } from '@/config/contracts';
import { CrashGuardCoreABI } from '@/config/abis/CrashGuardCore';
import { TokenInfo } from '@uniswap/token-lists';

/**
 * Hook to check if a token is supported by the CrashGuardCore contract
 */
export const useTokenSupport = (tokenAddress?: string) => {
  const chainId = useChainId();
  const contracts = getContracts(chainId);

  const { data: isSupported, isLoading, error, refetch } = useReadContract({
    address: contracts.CrashGuardCore as `0x${string}`,
    abi: CrashGuardCoreABI,
    functionName: 'supportedTokens',
    args: tokenAddress ? [tokenAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!tokenAddress && !!contracts.CrashGuardCore,
    },
  });

  return {
    isSupported: Boolean(isSupported),
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook to filter tokens by contract support
 */
export const useSupportedTokens = (tokens: TokenInfo[]) => {
  const chainId = useChainId();
  const contracts = getContracts(chainId);

  // Create contract calls for all tokens at once
  const contractCalls = useMemo(() => {
    if (!contracts.CrashGuardCore || !tokens.length) return [];

    return tokens.map(token => ({
      address: contracts.CrashGuardCore as `0x${string}`,
      abi: CrashGuardCoreABI,
      functionName: 'supportedTokens' as const,
      args: [token.address as `0x${string}`],
    }));
  }, [contracts.CrashGuardCore, tokens]);

  const { data, isLoading } = useReadContracts({
    contracts: contractCalls,
    allowFailure: false,
  });

  const { supportedTokens, unsupportedTokens } = useMemo(() => {
    if (!data || !tokens.length) {
      return { supportedTokens: [], unsupportedTokens: [] };
    }

    const supported: TokenInfo[] = [];
    const unsupported: TokenInfo[] = [];

    tokens.forEach((token, index) => {
      const result = data[index];
      const isSupported = Boolean(result);

      if (isSupported) {
        supported.push(token);
      } else {
        unsupported.push(token);
      }
    });

    return { supportedTokens: supported, unsupportedTokens: unsupported };
  }, [data, tokens]);

  return {
    supportedTokens,
    unsupportedTokens,
    isLoading,
    totalTokens: tokens.length,
    supportedCount: supportedTokens.length,
  };
};

/**
 * Hook to add a token to the supported list (owner only)
 */
export const useAddSupportedToken = () => {
  const chainId = useChainId();
  const contracts = getContracts(chainId);

  // This would typically use useContractWrite for the addSupportedToken function
  // For now, we'll return a placeholder that logs the action
  const addToken = (tokenAddress: string) => {
    console.log('Adding token to supported list:', {
      tokenAddress,
      contract: contracts.CrashGuardCore,
      chainId: chainId,
      timestamp: new Date().toISOString(),
    });

    // In a real implementation, this would call the contract's addSupportedToken function
    // This requires owner privileges on the contract
  };

  return { addToken };
};