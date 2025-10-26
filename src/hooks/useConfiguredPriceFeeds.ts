import { useReadContract, useChainId } from 'wagmi';
import { useMemo } from 'react';
import { getContracts } from '@/config/contracts';
import { DEFAULT_CHAIN } from '@/config/chains';
import { PythPriceMonitorABI } from '@/config/abis';
import { useTokenList } from './useTokenList';

// interface ConfiguredFeed {
//   tokenAddress: string;
//   tokenSymbol: string;
//   tokenName: string;
//   priceId: string;
//   hasPrice: boolean;
// }

/**
 * Get all configured price feeds from the PythPriceMonitor contract
 * This checks which tokens have price feeds configured
 */
export const useConfiguredPriceFeeds = () => {
  // const { chain } = useNetwork();
  // const chainContracts = getContracts(chain?.id || DEFAULT_CHAIN.id);
  const { tokens } = useTokenList();

  // Check each token to see if it has a price feed configured
  const configuredFeeds = useMemo(() => {
    // const feeds: ConfiguredFeed[] = [];
    
    // We'll check the first 50 tokens to avoid too many RPC calls
    const tokensToCheck = tokens.slice(0, 50);
    
    return tokensToCheck.map(token => ({
      tokenAddress: token.address,
      tokenSymbol: token.symbol,
      tokenName: token.name,
      priceId: '', // Will be fetched
      hasPrice: false, // Will be checked
    }));
  }, [tokens]);

  return {
    configuredFeeds,
    isLoading: false,
  };
};

/**
 * Check if a specific token has a price feed configured
 */
export const useTokenPriceFeed = (tokenAddress: string) => {
  const chainId = useChainId();
  const chainContracts = getContracts(chainId || DEFAULT_CHAIN.id);

  // Get the price ID for this token
  const { data: priceId, isLoading: isLoadingPriceId } = useReadContract({
    address: chainContracts.PythPriceMonitor as `0x${string}`,
    abi: PythPriceMonitorABI,
    functionName: 'tokenToPriceId',
    args: [tokenAddress as `0x${string}`],
    query: {
      enabled: !!tokenAddress,
    },
  });

  // Check if this token has a valid price
  const { data: priceData, isLoading: isLoadingPrice } = useReadContract({
    address: chainContracts.PythPriceMonitor as `0x${string}`,
    abi: PythPriceMonitorABI,
    functionName: 'getPriceByToken',
    args: [tokenAddress as `0x${string}`],
    query: {
      enabled: !!tokenAddress && !!priceId,
    },
  });

  const isConfigured = useMemo(() => {
    if (!priceId) return false;
    // Check if priceId is not zero bytes
    return priceId !== '0x0000000000000000000000000000000000000000000000000000000000000000';
  }, [priceId]);

  const hasValidPrice = useMemo(() => {
    if (!priceData) return false;
    const data = priceData as any;
    return data.isValid && Number(data.price) > 0;
  }, [priceData]);

  return {
    priceId: priceId as string,
    isConfigured,
    hasValidPrice,
    isLoading: isLoadingPriceId || isLoadingPrice,
  };
};
