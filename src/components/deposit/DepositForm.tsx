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
    useWriteContract,
    useWaitForTransactionReceipt,
    useReadContract,
    useChainId,
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
import { MultiTokenVaultABI } from "@/config/abis/multiTokenVault";
import { ERC20_ABI } from "@/config/abis/ERC20";
import { getContracts } from "@/config/contracts";
import { VAULT_CONTRACTS } from "@/config/vault";
import { usePortfolioData } from "@/hooks";
import { useVincentAbilities } from "@/hooks/useVincentAbilities";
import { useVincentAuth } from "@/components/auth/VincentAuth";
import { useVincentETHBalance, useVincentTokenBalance } from "@/hooks/useVincentBalance";
import { useUnifiedAuth, useTransactionSigner } from "@/hooks/useUnifiedAuth";
import {
    getTargetChainForDeposit,
    needsCrossChainOperation,
    getChainName,
    estimateCrossChainTime
} from "@/utils/crossChain";
import CrossChainDepositInfo from "./CrossChainDepositInfo";
import TokenSelectorWithBalances from "./TokenSelectorWithBalances";

const DepositForm: React.FC = () => {
    const { isConnected } = useAccount();
    const chainId = useChainId();

    // Use MultiTokenVault for deposits/withdrawals
    const vaultAddress = VAULT_CONTRACTS.MULTI_TOKEN_VAULT_ADDRESS;

    // Use current chain for contracts, but if Vincent is doing cross-chain, we'll handle it differently
    const contracts = getContracts(chainId);

    // Unified authentication state
    const unifiedAuth = useUnifiedAuth();
    const { getRecommendedSigner } = useTransactionSigner();

    // Individual auth states for backward compatibility
    const { isAuthenticated: isVincentAuthenticated, user: vincentUser } = useVincentAuth();

    const [selectedToken, setSelectedToken] = useState<SupportedToken>(
        SUPPORTED_TOKENS[0]
    ); // Default to ETH
    const [amount, setAmount] = useState("");
    const [isApproving, setIsApproving] = useState(false);
    const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");

    // Use unified auth state
    const effectiveAddress = unifiedAuth.address;
    const isEffectivelyConnected = unifiedAuth.isConnected;

    // Get portfolio data for withdrawals
    const { portfolio, refetch: refetchPortfolio } = usePortfolioData(effectiveAddress || undefined);

    // Vincent abilities for secure transactions
    const {
        depositToVault: vincentDepositToVault,
        isExecuting: isVincentExecuting,
    } = useVincentAbilities();

    // Bridge features (optional - not yet implemented in useVincentAbilities)
    // TODO: Implement bridge quote and status tracking

    // Determine target chain for deposits
    // When Vincent is connected but no wallet chain is detected, assume user wants to use cross-chain
    const currentChain = chainId || (isVincentAuthenticated ? 421614 : 421614); // Default to Arbitrum Sepolia
    const targetChain = getTargetChainForDeposit(currentChain);
    const needsCrossChain = needsCrossChainOperation(currentChain, targetChain);

    // Contract interactions using CrashGuardCore
    const {
        writeContract: writeDepositAsset,
        data: depositTxHash,
        isPending: isDepositLoading,
    } = useWriteContract();

    const {
        writeContract: writeWithdrawAsset,
        data: withdrawTxHash,
        isPending: isWithdrawLoading,
    } = useWriteContract();

    const {
        writeContract: writeApproveToken,
        data: approvalTxHash,
        isPending: isApprovalLoading,
    } = useWriteContract();

    // Check token allowance for ERC20 tokens (only for deposits)
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address:
            selectedToken.address !== "0x0000000000000000000000000000000000000000"
                ? (selectedToken.address as `0x${string}`)
                : undefined,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [effectiveAddress! as `0x${string}`, vaultAddress as `0x${string}`],
        query: {
            enabled:
                !!selectedToken &&
                !!effectiveAddress &&
                selectedToken.address !== "0x0000000000000000000000000000000000000000" &&
                mode === "deposit",
        },
    });



    // Transaction receipts for deposits
    const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
        hash: depositTxHash,
    });

    // Transaction receipts for withdrawals
    const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({
        hash: withdrawTxHash,
    });

    const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
        hash: approvalTxHash,
    });

    // Handle success callbacks
    React.useEffect(() => {
        if (isDepositSuccess) {
            setAmount("");
            toast.success(`Successfully deposited ${selectedToken.symbol}!`);
            refetchPortfolio?.();
        }
    }, [isDepositSuccess, selectedToken.symbol, refetchPortfolio]);

    React.useEffect(() => {
        if (isWithdrawSuccess) {
            setAmount("");
            toast.success(`Successfully withdrew ${selectedToken.symbol}!`);
            refetchPortfolio?.();
        }
    }, [isWithdrawSuccess, selectedToken.symbol, refetchPortfolio]);

    React.useEffect(() => {
        if (isApprovalSuccess) {
            setIsApproving(false);
            toast.success("Token approval successful!");
            refetchAllowance?.();
        }
    }, [isApprovalSuccess, refetchAllowance]);

    // Get user's ETH balance (use Vincent balance if Vincent is connected)
    const { data: wagmiEthBalance } = useBalance({
        address: effectiveAddress as `0x${string}`,
        query: {
            enabled: !!effectiveAddress && isConnected, // Only use wagmi if traditional wallet is connected
        },
    });

    const {
        data: vincentEthBalance,
        isLoading: isVincentEthLoading,
        error: vincentEthError,
        refetch: refetchVincentEth
    } = useVincentETHBalance(
        isVincentAuthenticated ? currentChain : undefined
    );

    // Get user's token balance for ERC20 tokens
    const { data: wagmiTokenBalance } = useBalance({
        address: effectiveAddress as `0x${string}`,
        token:
            selectedToken.address !== "0x0000000000000000000000000000000000000000"
                ? (selectedToken.address as `0x${string}`)
                : undefined,
        query: {
            enabled: !!effectiveAddress && isConnected, // Only use wagmi if traditional wallet is connected
        },
    });

    const {
        data: vincentTokenBalance,
        isLoading: isVincentTokenLoading,
        error: vincentTokenError,
        refetch: refetchVincentToken
    } = useVincentTokenBalance(
        isVincentAuthenticated ? currentChain : undefined,
        selectedToken.address !== "0x0000000000000000000000000000000000000000"
            ? selectedToken.address
            : undefined
    );

    // Use appropriate balance based on connection type
    const ethBalance = isVincentAuthenticated && !isConnected ? vincentEthBalance : wagmiEthBalance;
    const tokenBalance = isVincentAuthenticated && !isConnected ? vincentTokenBalance : wagmiTokenBalance;

    const isETH =
        selectedToken.address === "0x0000000000000000000000000000000000000000";

    // For deposits, use wallet balance; for withdrawals, use vault balance
    const currentBalance = useMemo(() => {
        if (mode === "deposit") {
            const balance = isETH ? ethBalance : tokenBalance;
            // Normalize balance to always have a value property
            if (!balance) return null;
            if (typeof balance === 'bigint') {
                return {
                    value: balance,
                    decimals: selectedToken.decimals,
                    symbol: selectedToken.symbol,
                };
            }
            return balance;
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
        if (mode === "withdraw" || isETH || !effectiveAddress || !hasValidAmount)
            return false;
        if (!allowance) return true; // If we can't check allowance, assume approval needed
        try {
            return allowance < parsedAmount;
        } catch {
            return true;
        }
    }, [mode, isETH, effectiveAddress, hasValidAmount, allowance, parsedAmount]);

    // Handle approval for ERC20 tokens
    const handleApproval = useCallback(async () => {
        if (isETH || !effectiveAddress || !selectedToken) return;

        try {
            setIsApproving(true);

            writeApproveToken({
                address: selectedToken.address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: "approve",
                args: [vaultAddress as `0x${string}`, parsedAmount],
            });
        } catch (error) {
            console.error("Approval error:", error);
            toast.error("Failed to approve token spend");
            setIsApproving(false);
        }
    }, [isETH, effectiveAddress, selectedToken, writeApproveToken, parsedAmount, contracts]);

    // Handle deposit
    const handleDeposit = useCallback(async () => {
        if (!effectiveAddress || !hasValidAmount || !selectedToken) return;

        console.log('🔵 Deposit initiated:', {
            token: selectedToken.symbol,
            address: selectedToken.address,
            amount: amount,
            parsedAmount: parsedAmount.toString(),
            isETH,
            effectiveAddress,
            contractAddress: contracts.CrashGuardCore,
        });

        // Validate minimum amount (at least 0.0001 for most tokens)
        if (parsedAmount < BigInt(100000000000000)) { // 0.0001 in wei
            toast.error('Amount too small. Minimum deposit is 0.0001');
            return;
        }

        // Check if vault address exists
        if (!vaultAddress) {
            toast.error('Vault not deployed on this network');
            console.error('❌ Invalid vault address:', vaultAddress);
            return;
        }

        try {
            // If Vincent is authenticated and cross-chain is needed, use Vincent abilities
            if (isVincentAuthenticated && needsCrossChain) {
                const targetContracts = getContracts(targetChain);

                toast.loading(`Initiating cross-chain deposit from ${getChainName(currentChain)} to ${getChainName(targetChain)}...`);

                await vincentDepositToVault({
                    token: selectedToken.address,
                    amount: parsedAmount.toString(),
                    vaultAddress: targetContracts.CrashGuardCore,
                });

                toast.success(`Cross-chain deposit initiated! Estimated time: ${estimateCrossChainTime(currentChain, targetChain)}`);
            } else {
                // Regular deposit using Wagmi with MultiTokenVault
                console.log('📤 Sending transaction:', {
                    vault: vaultAddress,
                    function: isETH ? 'depositETH' : 'deposit',
                    token: selectedToken.address,
                    amount: parsedAmount.toString(),
                    value: isETH ? parsedAmount.toString() : '0',
                });

                if (isETH) {
                    // Deposit ETH - use depositETH() function
                    writeDepositAsset({
                        address: vaultAddress as `0x${string}`,
                        abi: MultiTokenVaultABI,
                        functionName: "depositETH",
                        args: [],
                        value: parsedAmount,
                    });
                } else {
                    // Deposit ERC20 token - use deposit(token, amount)
                    writeDepositAsset({
                        address: vaultAddress as `0x${string}`,
                        abi: MultiTokenVaultABI,
                        functionName: "deposit",
                        args: [selectedToken.address as `0x${string}`, parsedAmount],
                    });
                }

                toast.success(`Depositing ${amount} ${selectedToken.symbol}...`);
            }
        } catch (error: any) {
            console.error("❌ Deposit error:", error);

            // Extract meaningful error message
            let errorMessage = "Failed to deposit";
            if (error?.message) {
                if (error.message.includes('user rejected')) {
                    errorMessage = "Transaction rejected by user";
                } else if (error.message.includes('insufficient funds')) {
                    errorMessage = "Insufficient funds for transaction";
                } else if (error.message.includes('execution reverted')) {
                    errorMessage = "Transaction would fail - check contract requirements";
                } else {
                    errorMessage = error.message.slice(0, 100);
                }
            }

            toast.error(errorMessage);
        }
    }, [
        effectiveAddress,
        hasValidAmount,
        selectedToken,
        isETH,
        writeDepositAsset,
        parsedAmount,
        amount,
        isVincentAuthenticated,
        needsCrossChain,
        currentChain,
        targetChain,
        vincentDepositToVault,
        contracts,
    ]);

    // Handle withdrawal
    const handleWithdraw = useCallback(async () => {
        if (!effectiveAddress || !hasValidAmount || !selectedToken) return;

        try {
            console.log('📤 Withdrawing:', {
                vault: vaultAddress,
                function: isETH ? 'withdrawETH' : 'withdraw',
                token: selectedToken.address,
                amount: parsedAmount.toString(),
            });

            if (isETH) {
                // Withdraw ETH - use withdrawETH(amount)
                writeWithdrawAsset({
                    address: vaultAddress as `0x${string}`,
                    abi: MultiTokenVaultABI,
                    functionName: "withdrawETH",
                    args: [parsedAmount],
                });
            } else {
                // Withdraw ERC20 token - use withdraw(token, amount)
                writeWithdrawAsset({
                    address: vaultAddress as `0x${string}`,
                    abi: MultiTokenVaultABI,
                    functionName: "withdraw",
                    args: [selectedToken.address as `0x${string}`, parsedAmount],
                });
            }

            toast.success(`Withdrawing ${amount} ${selectedToken.symbol}...`);
        } catch (error) {
            console.error("Withdrawal error:", error);
            toast.error("Failed to withdraw");
        }
    }, [
        effectiveAddress,
        hasValidAmount,
        selectedToken,
        writeWithdrawAsset,
        parsedAmount,
        amount,
        vaultAddress,
        isETH,
    ]);



    const canTransact =
        hasValidAmount && (mode === "withdraw" || !needsApproval || isETH || (isVincentAuthenticated && needsCrossChain));
    const isLoading =
        isDepositConfirming ||
        isWithdrawConfirming ||
        isApprovalConfirming ||
        isDepositLoading ||
        isWithdrawLoading ||
        isApprovalLoading ||
        isVincentExecuting;

    // Debug connection status
    console.log('DepositForm connection status:', {
        unifiedAuth,
        isConnected,
        isVincentAuthenticated,
        isEffectivelyConnected,
        effectiveAddress,
        vincentUser: vincentUser?.pkpAddress,
        chainId,
        currentChain,
        targetChain,
        needsCrossChain,
        recommendedSigner: getRecommendedSigner(needsCrossChain),
    });

    if (!isEffectivelyConnected) {
        return (
            <div className="p-8 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm text-center">
                <h3 className="text-xl font-semibold text-white mb-4">
                    Connect Wallet or Vincent
                </h3>
                <p className="text-gray-400 mb-4">
                    Please connect your wallet or authenticate with Vincent to start depositing
                </p>
                <div className="flex flex-col gap-3 max-w-sm mx-auto">
                    <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-orange-400" />
                            <div className="text-left">
                                <h4 className="text-sm font-medium text-orange-400">Vincent Authentication</h4>
                                <p className="text-xs text-orange-300/80">
                                    Use Vincent for secure, gasless transactions
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">
                        Or click "Connect Wallet" in the header for traditional wallet connection
                    </p>
                </div>

                {/* Debug info */}
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg text-xs text-left">
                    <div className="text-gray-400 mb-2">Debug Info:</div>
                    <div className="space-y-1 text-gray-500">
                        <div>Auth Method: {unifiedAuth.authMethod}</div>
                        <div>Wallet Connected: {isConnected ? 'Yes' : 'No'}</div>
                        <div>Vincent Authenticated: {isVincentAuthenticated ? 'Yes' : 'No'}</div>
                        <div>Effective Address: {effectiveAddress || 'None'}</div>
                        <div>Can Same-Chain: {unifiedAuth.canDoSameChain ? 'Yes' : 'No'}</div>
                        <div>Can Cross-Chain: {unifiedAuth.canDoCrossChain ? 'Yes' : 'No'}</div>
                        <div>Recommended Signer: {getRecommendedSigner(needsCrossChain) || 'None'}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="p-8 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm glow-border"
            style={{ position: "relative", zIndex: 1 }}
        >
            <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-red-400" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    Vault Operations
                </h2>
            </div>

            <div className="space-y-6">
                {/* Connection Status */}
                <div className="p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isEffectivelyConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                            <span className="text-gray-300">
                                {unifiedAuth.authMethod === 'vincent' ? 'Vincent Connected' :
                                    unifiedAuth.authMethod === 'wallet' ? 'Wallet Connected' :
                                        unifiedAuth.authMethod === 'both' ? 'Both Connected' : 'Not Connected'}
                            </span>
                        </div>
                        <div className="text-gray-400 text-xs">
                            {effectiveAddress ? `${effectiveAddress.substring(0, 6)}...${effectiveAddress.substring(-4)}` : 'No Address'}
                        </div>
                    </div>
                    {needsCrossChain && (
                        <div className="mt-2 text-xs text-blue-400">
                            Cross-chain deposit: {getChainName(currentChain)} → {getChainName(targetChain)}
                        </div>
                    )}
                </div>

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
                            ? "bg-red-500 text-white shadow-lg"
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

                {/* Cross-Chain Info */}
                {needsCrossChain && mode === "deposit" && (
                    <div className="space-y-4">
                        <CrossChainDepositInfo
                            fromChain={currentChain}
                            toChain={targetChain}
                            isVincentAuthenticated={isVincentAuthenticated}
                            tokenSymbol={selectedToken.symbol}
                            amount={amount}
                        />

                        {/* Bridge Quote and Status - Features not yet implemented */}
                        {/* TODO: Implement bridge quote and status tracking in useVincentAbilities */}
                    </div>
                )}

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

                {/* Token Selection with Balances */}
                <TokenSelectorWithBalances
                    tokens={SUPPORTED_TOKENS}
                    selectedToken={selectedToken}
                    onTokenSelect={setSelectedToken}
                    mode={mode}
                    currentChain={currentChain}
                />

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
                            className="w-full p-4 pr-20 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                            step="any"
                            min="0"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {selectedToken.symbol}
                        </div>
                    </div>

                    {currentBalance && (
                        <div className="mt-2 space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">
                                    {mode === "deposit" ? (
                                        unifiedAuth.authMethod === 'vincent' ? "Vincent Wallet" :
                                            unifiedAuth.authMethod === 'wallet' ? "Web3 Wallet" :
                                                "Wallet"
                                    ) : "Vault"} Balance:{" "}
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
                                    className="text-orange-400 hover:text-orange-300 transition-colors"
                                >
                                    Max
                                </button>
                            </div>

                            {/* Show Vincent address when using Vincent */}
                            {mode === "deposit" && unifiedAuth.authMethod === 'vincent' && vincentUser?.pkpAddress && (
                                <div className="text-xs text-gray-500">
                                    Vincent PKP: {vincentUser.pkpAddress.slice(0, 6)}...{vincentUser.pkpAddress.slice(-4)}
                                </div>
                            )}

                            {/* Show loading state for Vincent balances */}
                            {mode === "deposit" && unifiedAuth.authMethod === 'vincent' && (
                                (isETH && isVincentEthLoading) || (!isETH && isVincentTokenLoading)
                            ) && (
                                    <div className="text-xs text-yellow-400 flex items-center gap-1">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Fetching Vincent wallet balance...
                                    </div>
                                )}

                            {/* Show error state for Vincent balances */}
                            {mode === "deposit" && unifiedAuth.authMethod === 'vincent' && (
                                (isETH && vincentEthError) || (!isETH && vincentTokenError)
                            ) && (
                                    <div className="text-xs text-red-400 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" />
                                        Failed to fetch balance
                                        <button
                                            onClick={() => {
                                                if (isETH) {
                                                    refetchVincentEth();
                                                } else {
                                                    refetchVincentToken();
                                                }
                                            }}
                                            className="ml-1 text-orange-400 hover:text-orange-300 underline"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                )}
                        </div>
                    )}
                </div>
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
                            className="w-full p-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {isVincentExecuting
                                        ? "Cross-chain depositing..."
                                        : isDepositConfirming
                                            ? "Depositing..."
                                            : "Processing..."}
                                </>
                            ) : (
                                <>
                                    <ArrowDownCircle className="h-4 w-4" />
                                    {needsCrossChain && isVincentAuthenticated
                                        ? `Cross-chain Deposit ${selectedToken.symbol}`
                                        : `Deposit ${selectedToken.symbol}`}
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
                {(depositTxHash || withdrawTxHash) && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Transaction submitted</span>
                        </div>
                        <a
                            href={`https://sepolia.basescan.io/tx/${depositTxHash || withdrawTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-red-400 hover:text-red-300 underline mt-1 block"
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