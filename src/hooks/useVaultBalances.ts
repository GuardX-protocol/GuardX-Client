import { useContractRead } from "wagmi";
import { useMemo } from "react";
import { formatUnits } from "viem";
import { VAULT_CONTRACTS, SUPPORTED_TOKENS } from "@/config/vault";
import { MultiTokenVaultABI } from "@/config/abis/multiTokenVault";

export const useVaultBalances = (address?: `0x${string}`) => {
  // Get ETH balance in vault
  const { data: ethBalance, refetch: refetchEthBalance } = useContractRead({
    address: VAULT_CONTRACTS.MULTI_TOKEN_VAULT_ADDRESS,
    abi: MultiTokenVaultABI,
    functionName: "getUserETHBalance",
    args: [address!],
    enabled: !!address,
    watch: true,
  });

  // Get WETH balance in vault (if any)
  const { data: wethBalance, refetch: refetchWethBalance } = useContractRead({
    address: VAULT_CONTRACTS.MULTI_TOKEN_VAULT_ADDRESS,
    abi: MultiTokenVaultABI,
    functionName: "getUserBalance",
    args: [address!, "0x4200000000000000000000000000000000000006"], // WETH address
    enabled: !!address,
    watch: true,
  });

  // Get supported tokens for display
  const { data: supportedTokensData } = useContractRead({
    address: VAULT_CONTRACTS.MULTI_TOKEN_VAULT_ADDRESS,
    abi: MultiTokenVaultABI,
    functionName: "getSupportedTokensWithSymbols",
    enabled: true,
  });

  const vaultAssets = useMemo(() => {
    if (!address) return [];

    const assets = [];

    // Add ETH if user has balance
    if (ethBalance && ethBalance > 0n) {
      assets.push({
        tokenAddress: "0x0000000000000000000000000000000000000000",
        symbol: "ETH",
        name: "Ethereum",
        amount: ethBalance,
        decimals: 18,
        formattedAmount: formatUnits(ethBalance, 18),
        valueUSD: ethBalance, // For now, just use the amount - you can add price feeds later
      });
    }

    // Add WETH if user has balance
    if (wethBalance && wethBalance > 0n) {
      assets.push({
        tokenAddress: "0x4200000000000000000000000000000000000006",
        symbol: "WETH",
        name: "Wrapped Ether",
        amount: wethBalance,
        decimals: 18,
        formattedAmount: formatUnits(wethBalance, 18),
        valueUSD: wethBalance,
      });
    }

    return assets;
  }, [address, ethBalance, wethBalance]);

  const totalValue = useMemo(() => {
    return vaultAssets.reduce((total, asset) => {
      return total + Number(asset.formattedAmount);
    }, 0);
  }, [vaultAssets]);

  const refetchAll = () => {
    refetchEthBalance();
    refetchWethBalance();
  };

  return {
    assets: vaultAssets,
    totalValue,
    ethBalance,
    wethBalance,
    isLoading: !ethBalance && !wethBalance,
    refetchAll,
  };
};

export default useVaultBalances;
