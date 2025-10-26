import React, { useState, useMemo, useCallback } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  AlertTriangle,
  Check,
  Loader2,
  TrendingDown,
  Shield,
} from "lucide-react";
import {
  useAccount,
  useBalance,
  useContractWrite,
  useWaitForTransaction,
  useContractRead,
  useNetwork,
} from "wagmi";
import {
  parseUnits,
  formatUnits,
} from "viem";
import toast from "react-hot-toast";
import AlertAwareWithdrawForm from "./AlertAwareWithdrawForm";

import {
  SUPPORTED_TOKENS,
  type SupportedToken,
} from "../../config/vault";
import { CrashGuardCoreABI } from "@/config/abis/CrashGuardCore";
import { ERC20_ABI } from "@/config/abis/ERC20";
import { getContracts } from "@/config/contracts";
import { usePortfolioData } from "@/hooks";
import { useVincentAbilities } from "@/hooks/useVincentAbilities";

const DepositForm: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const contracts = getContracts(chain?.id);

  const [selectedToken, setSelectedToken] = useState<SupportedToken>(
    SUPPORTED_TOKENS[0]
  ); // Default to ETH
  const [amount, setAmount] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");

  // Get portfolio data for withdrawals
  const { portfolio, refetch: refetchPortfolio } = usePortfolioData(address);

  // Vincent abilities for secure transactions
  useVincentAbilities();

  // Contract interactions using CrashGuardCore
  const {
    write: depositAsset,
    data: depositTx,
    isLoading: isDepositLoading,
  } = useContractWrite({
    address: contracts.CrashGuardCore as `0x${string}`,
    abi: CrashGuardCoreABI,
    functionName: "depositAsset",
  });

  const {
    write: withdrawAsset,
    data: withdrawTx,
    isLoading: isWithdrawLoading,
  } = useContractWrite({
    address: contracts.CrashGuardCore as `0x${string}`,
    abi: CrashGuardCoreABI,
    functionName: "withdrawAsset",
  });

  const {
    write: approveToken,
    data: approvalTx,
    isLoading: isApprovalLoading,
  } = useContractWrite({
    address:
      selectedToken.address !== "0x0000000000000000000000000000000000000000"
        ? (selectedToken.address as `0x${string}`)
        : undefined,
    abi: ERC20_ABI,
    functionName: "approve",
  });

  // Check token allowance for ERC20 tokens (only for deposits)
  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address:
      selectedToken.address !== "0x0000000000000000000000000000000000000000"
        ? (selectedToken.address as `0x${string}`)
        : undefined,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [address!, contracts.CrashGuardCore as `0x${string}`],
    enabled:
      !!selectedToken &&
      !!address &&
      selectedToken.address !== "0x0000000000000000000000000000000000000000" &&
      mode === "deposit",
    watch: true,
  });



  // Transaction receipts for deposits
  const { isLoading: isDepositConfirming } = useWaitForTransaction({
    hash: depositTx?.hash,
    onSuccess: () => {
      setAmount("");
      toast.success(`Successfully deposited ${selectedToken.symbol}!`);
      refetchPortfolio?.();
    },
    onError: (error) => {
      toast.error("Deposit failed: " + error.message);
    },
  });

  // Transaction receipts for withdrawals
  const { isLoading: isWithdrawConfirming } = useWaitForTransaction({
    hash: withdrawTx?.hash,
    onSuccess: () => {
      setAmount("");
      toast.success(`Successfully withdrew ${selectedToken.symbol}!`);
      refetchPortfolio?.();
    },
    onError: (error) => {
      toast.error("Withdrawal failed: " + error.message);
    },
  });

  const { isLoading: isApprovalConfirming } = useWaitForTransaction({
    hash: approvalTx?.hash,
    onSuccess: () => {
      setIsApproving(false);
      toast.success("Token approval successful!");
      refetchAllowance?.();
    },
    onError: (error) => {
      toast.error("Approval failed: " + error.message);
      setIsApproving(false);
    },
  });

  // Get user's ETH balance
  const { data: ethBalance } = useBalance({
    address: address,
  });

  // Get user's token balance for ERC20 tokens
  const { data: tokenBalance } = useBalance({
    address: address,
    token:
      selectedToken.address !== "0x0000000000000000000000000000000000000000"
        ? (selectedToken.address as `0x${string}`)
        : undefined,
  });

  const isETH =
    selectedToken.address === "0x0000000000000000000000000000000000000000";

  // For deposits, use wallet balance; for withdrawals, use vault balance
  const currentBalance = useMemo(() => {
    if (mode === "deposit") {
      return isETH ? ethBalance : tokenBalance;
    } else {
      // For withdrawals, get balance from portfolio
      const portfolioData = portfolio as any;
      if (portfolioData) {
        let assets: any[] = [];
        if (Array.isArray(portfolioData) && portfolioData.length >= 1) {
          assets = portfolioData[0] || [];
        } else if (portfolioData.assets) {
          assets = portfolioData.assets || [];
        }

        const vaultAsset = assets.find((asset: any) => {
          const tokenAddress = asset.tokenAddress || asset[0] || asset;
          return tokenAddress?.toLowerCase() === selectedToken.address.toLowerCase();
        });

        if (vaultAsset) {
          const amount = vaultAsset.amount || vaultAsset[1] || 0;
          return {
            value: BigInt(amount || 0),
            decimals: selectedToken.decimals,
            symbol: selectedToken.symbol,
          };
        }
      }
      return null;
    }
  }, [mode, isETH, ethBalance, tokenBalance, portfolio, selectedToken]);

  // Parse amount with proper decimals
  const parseAmount = (value: string) => {
    if (!value || value === "") return BigInt(0);
    try {
      return parseUnits(value, selectedToken.decimals);
    } catch {
      return BigInt(0);
    }
  };

  const parsedAmount = parseAmount(amount);
  const hasValidAmount = useMemo(() => {
    // Check if amount is greater than 0
    if (parsedAmount <= 0) return false;

    // Check if we have balance data
    if (!currentBalance?.value) return false;

    // Check if amount doesn't exceed balance
    return parsedAmount <= currentBalance.value;
  }, [parsedAmount, currentBalance]);

  // Check if approval is needed for ERC20 tokens (only for deposits)
  const needsApproval = useMemo(() => {
    if (mode === "withdraw" || isETH || !address || !hasValidAmount)
      return false;
    if (!allowance) return true; // If we can't check allowance, assume approval needed
    try {
      return allowance < parsedAmount;
    } catch {
      return true;
    }
  }, [mode, isETH, address, hasValidAmount, allowance, parsedAmount]);

  // Handle approval for ERC20 tokens
  const handleApproval = useCallback(async () => {
    if (isETH || !address || !selectedToken) return;

    try {
      setIsApproving(true);

      approveToken?.({
        args: [contracts.CrashGuardCore as `0x${string}`, parsedAmount],
      });
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Failed to approve token spend");
      setIsApproving(false);
    }
  }, [isETH, address, selectedToken, approveToken, parsedAmount, contracts]);

  // Handle deposit
  const handleDeposit = useCallback(async () => {
    if (!address || !hasValidAmount || !selectedToken) return;

    try {
      if (isETH) {
        // Deposit ETH - pass ETH address and send value
        depositAsset?.({
          args: [selectedToken.address as `0x${string}`, parsedAmount],
          value: parsedAmount,
        });
      } else {
        // Deposit ERC20 token
        depositAsset?.({
          args: [selectedToken.address as `0x${string}`, parsedAmount],
        });
      }

      toast.success(`Depositing ${amount} ${selectedToken.symbol}...`);
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error("Failed to deposit");
    }
  }, [
    address,
    hasValidAmount,
    selectedToken,
    isETH,
    depositAsset,
    parsedAmount,
    amount,
  ]);

  // Handle withdrawal
  const handleWithdraw = useCallback(async () => {
    if (!address || !hasValidAmount || !selectedToken) return;

    try {
      // Withdraw asset using CrashGuardCore
      withdrawAsset?.({
        args: [selectedToken.address as `0x${string}`, parsedAmount],
      });

      toast.success(`Withdrawing ${amount} ${selectedToken.symbol}...`);
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Failed to withdraw");
    }
  }, [
    address,
    hasValidAmount,
    selectedToken,
    withdrawAsset,
    parsedAmount,
    amount,
  ]);

  const canTransact =
    hasValidAmount && (mode === "withdraw" || !needsApproval || isETH);
  const isLoading =
    isDepositConfirming ||
    isWithdrawConfirming ||
    isApprovalConfirming ||
    isDepositLoading ||
    isWithdrawLoading ||
    isApprovalLoading;

  if (!isConnected) {
    return (
      <div className="p-8 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm text-center">
        <h3 className="text-xl font-semibold text-white mb-4">
          Connect Wallet
        </h3>
        <p className="text-gray-400">
          Please connect your wallet to start depositing
        </p>
      </div>
    );
  }

  return (
    <div
      className="p-8 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm glow-border"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-cyan-400" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Vault Operations
        </h2>
      </div>

      <div className="space-y-6">
        {/* Mode Selection */}
        <div className="flex p-1 bg-gray-900/50 rounded-xl border border-gray-700">
          <button
            onClick={() => {
              console.log("Deposit button clicked!");
              setMode("deposit");
              setAmount("");
            }}
            style={{
              cursor: "pointer",
              pointerEvents: "auto",
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${mode === "deposit"
              ? "bg-cyan-500 text-white shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
          >
            <ArrowDownCircle className="h-4 w-4" />
            Deposit
          </button>
          <button
            onClick={() => {
              console.log("Withdraw button clicked!");
              setMode("withdraw");
              setAmount("");
            }}
            style={{
              cursor: "pointer",
              pointerEvents: "auto",
            }}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${mode === "withdraw"
              ? "bg-purple-500 text-white shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
          >
            <ArrowUpCircle className="h-4 w-4" />
            Withdraw
          </button>
        </div>

        {/* Risk Warning */}
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <TrendingDown className="h-5 w-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-400 mb-1">
                Crash Protection Vault
              </h4>
              <p className="text-xs text-yellow-300/80">
                {mode === "deposit"
                  ? "Deposit volatile assets for 24/7 crash protection monitoring."
                  : "Withdraw your protected assets from the vault anytime."}
              </p>
            </div>
          </div>
        </div>

        {/* Token Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Select Asset to {mode === "deposit" ? "Deposit" : "Withdraw"}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUPPORTED_TOKENS.map((token) => (
              <button
                key={token.address}
                onClick={() => setSelectedToken(token)}
                className={`p-4 rounded-xl border transition-all ${selectedToken.address === token.address
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-gray-700 bg-gray-900/50 hover:border-gray-600"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={token.logoURI}
                    alt={token.symbol}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">
                      {token.symbol}
                    </div>
                    <div className="text-xs text-gray-400">{token.name}</div>
                  </div>
                  {selectedToken.address === token.address && (
                    <Check className="h-4 w-4 text-cyan-400 ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Amount to {mode === "deposit" ? "Deposit" : "Withdraw"}
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`0.0 ${selectedToken.symbol}`}
              className="w-full p-4 pr-20 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none transition-colors"
              step="any"
              min="0"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {selectedToken.symbol}
            </div>
          </div>

          {/* Balance Display */}
          {currentBalance && (
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-gray-400">
                {mode === "deposit" ? "Wallet" : "Vault"} Balance:{" "}
                {formatUnits(currentBalance.value, selectedToken.decimals)}{" "}
                {selectedToken.symbol}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  console.log("Max button clicked!", {
                    currentBalance: currentBalance?.value?.toString(),
                    decimals: selectedToken.decimals,
                    formatted: formatUnits(
                      currentBalance!.value,
                      selectedToken.decimals
                    ),
                  });
                  setAmount(
                    formatUnits(currentBalance!.value, selectedToken.decimals)
                  );
                }}
                style={{
                  cursor: "pointer",
                  zIndex: 20,
                  position: "relative",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                }}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Max
              </button>
            </div>
          )}
        </div>

        {/* Validation Messages */}
        {amount && !hasValidAmount && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>
              {parsedAmount <= 0
                ? "Enter a valid amount"
                : !currentBalance?.value
                  ? "Loading balance..."
                  : "Insufficient balance"}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3" style={{ position: "relative", zIndex: 10 }}>
          {needsApproval && !isETH && hasValidAmount && mode === "deposit" && (
            <button
              onClick={handleApproval}
              disabled={isApproving || isApprovalConfirming}
              className="w-full p-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isApproving || isApprovalConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Approve {selectedToken.symbol}
                </>
              )}
            </button>
          )}

          {mode === "deposit" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleDeposit();
              }}
              disabled={!canTransact || isLoading}
              style={{
                opacity: !canTransact || isLoading ? 0.5 : 1,
                pointerEvents: !canTransact || isLoading ? "none" : "auto",
                cursor: !canTransact || isLoading ? "not-allowed" : "pointer",
              }}
              className="w-full p-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isDepositConfirming ? "Depositing..." : "Processing..."}
                </>
              ) : (
                <>
                  <ArrowDownCircle className="h-4 w-4" />
                  Deposit {selectedToken.symbol}
                </>
              )}
            </button>
          ) : (
            <AlertAwareWithdrawForm
              selectedToken={selectedToken}
              amount={amount}
              onWithdraw={handleWithdraw}
              isLoading={isLoading}
              disabled={!canTransact}
            />
          )}
        </div>

        {/* Transaction Status */}
        {(depositTx?.hash || withdrawTx?.hash) && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Transaction submitted</span>
            </div>
            <a
              href={`https://sepolia.basescan.io/tx/${depositTx?.hash || withdrawTx?.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 underline mt-1 block"
            >
              View on Explorer
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositForm;
