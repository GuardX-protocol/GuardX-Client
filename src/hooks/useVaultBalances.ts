import { useReadContract, useChainId } from "wagmi";
import { useMemo } from "react";
import { formatUnits } from "viem";
import { getContracts } from "@/config/contracts";
import { CrashGuardCoreABI } from "@/config/abis/CrashGuardCore";

export const useVaultBalances = (address?: `0x${string}`) => {
  const chainId = useChainId();
  const contracts = getContracts(chainId);

  // Get user portfolio from CrashGuardCore
  const { data: portfolio, refetch: refetchPortfolio } = useReadContract({
    address: contracts.CrashGuardCore as `0x${string}`,
    abi: CrashGuardCoreABI,
    functionName: "getUserPortfolio",
    args: [address!],
    query: {
      enabled: !!address && !!contracts.CrashGuardCore,
    },
  });

  const vaultAssets = useMemo(() => {
    if (!address || !portfolio) return [];

    const portfolioData = portfolio as any;
    let assets: any[] = [];

    // Handle portfolio data structure: [assets, totalValue, riskScore]
    if (Array.isArray(portfolioData) && portfolioData.length >= 1) {
      assets = portfolioData[0] || [];
    } else if (portfolioData.assets) {
      assets = portfolioData.assets || [];
    }

    // Map assets to the expected format
    return assets.map((asset: any) => {
      const tokenAddress = asset.tokenAddress || asset[0] || asset;
      const amount = asset.amount || asset[1] || 0;
      const valueUSD = asset.valueUSD || asset[2] || 0;

      // Determine token info from address
      const getTokenInfo = (address: string) => {
        const addr = address?.toLowerCase();
        if (addr === '0x0000000000000000000000000000000000000000') return { symbol: 'ETH', name: 'Ethereum', decimals: 18 };
        if (addr === '0x4200000000000000000000000000000000000006') return { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 };
        return { symbol: 'TOKEN', name: 'Unknown Token', decimals: 18 };
      };

      const tokenInfo = getTokenInfo(tokenAddress);

      return {
        tokenAddress,
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        amount: BigInt(amount || 0),
        decimals: tokenInfo.decimals,
        formattedAmount: formatUnits(BigInt(amount || 0), tokenInfo.decimals),
        valueUSD: BigInt(valueUSD || 0),
      };
    }).filter((asset: any) => asset.amount > 0n);
  }, [address, portfolio]);

  const totalValue = useMemo(() => {
    if (!portfolio) return 0;
    
    const portfolioData = portfolio as any;
    if (Array.isArray(portfolioData) && portfolioData.length >= 2) {
      return Number(formatUnits(BigInt(portfolioData[1] || 0), 18));
    } else if (portfolioData.totalValue) {
      return Number(formatUnits(BigInt(portfolioData.totalValue || 0), 18));
    }
    
    return vaultAssets.reduce((total, asset) => {
      return total + Number(asset.formattedAmount);
    }, 0);
  }, [portfolio, vaultAssets]);

  const refetchAll = () => {
    refetchPortfolio();
  };

  return {
    assets: vaultAssets,
    totalValue,
    portfolio,
    isLoading: !portfolio,
    refetchAll,
  };
};

export default useVaultBalances;
