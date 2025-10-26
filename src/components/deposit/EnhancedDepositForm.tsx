import React, { useState, useCallback, useMemo } from 'react';
import { ArrowRight, Loader2, AlertTriangle, Shield, Zap, Wallet } from 'lucide-react';
import { parseUnits, formatUnits } from 'viem';
import toast from 'react-hot-toast';
import { useVincentAuth } from '@/components/auth/VincentAuth';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { usePKPOperations } from '@/hooks/usePKPWallet';
import { useWalletTokenBalance } from '@/hooks/useWalletTokenBalance';
import UniversalTokenSelector from './UniversalTokenSelector';
import PKPFundingFlow from './PKPFundingFlow';
import { getContracts } from '@/config/contracts';
import { getTargetChainForDeposit, needsCrossChainOperation, getChainName } from '@/utils/crossChain';

interface TokenOption {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
    chainId: number;
    balance?: string;
    formattedBalance?: string;
    isNative?: boolean;
}

const EnhancedDepositForm: React.FC = () => {
    const { isAuthenticated, user } = useVincentAuth();
    const { isConnected: isWalletConnected } = useWeb3Auth();
    const pkpOperations = usePKPOperations(84532); // Base Sepolia for vault operations

    const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null);
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showFundingFlow, setShowFundingFlow] = useState(false);

    // Determine chains and operations needed
    const sourceChain = 421614; // Arbitrum Sepolia (where user has tokens)
    const targetChain = getTargetChainForDeposit(sourceChain); // Base Sepolia (where vault is)
    const needsCrossChain = needsCrossChainOperation(sourceChain, targetChain);
    const targetContracts = getContracts(targetChain);

    // Get balance for selected token
    const { balance: tokenBalance, loading: balanceLoading, refetch: refetchBalance } = useWalletTokenBalance(
        sourceChain,
        selectedToken?.isNative ? undefined : selectedToken?.address
    );

    // Parse amount with proper decimals
    const parsedAmount = useMemo(() => {
        if (!amount || !selectedToken) return BigInt(0);
        try {
            return parseUnits(amount, selectedToken.decimals);
        } catch {
            return BigInt(0);
        }
    }, [amount, selectedToken]);

    // Check if user has sufficient balance
    const hasValidAmount = useMemo(() => {
        if (!selectedToken || !tokenBalance || parsedAmount <= 0) return false;

        const availableBalance = selectedToken.isNative
            ? BigInt(tokenBalance.nativeBalance)
            : BigInt(tokenBalance.tokenBalance || '0');

        return parsedAmount <= availableBalance;
    }, [selectedToken, tokenBalance, parsedAmount]);

    // Determine what operations are needed
    const getOperationPlan = useCallback(() => {
        if (!selectedToken) return null;

        const isTargetToken = selectedToken.symbol === 'ETH' || selectedToken.symbol === 'WETH';
        const needsSwap = !isTargetToken;
        const needsBridge = needsCrossChain;

        return {
            needsSwap,
            needsBridge,
            operations: [
                needsSwap && 'Swap to ETH/WETH',
                needsBridge && `Bridge to ${getChainName(targetChain)}`,
                'Deposit to Vault'
            ].filter(Boolean),
            estimatedTime: needsSwap && needsBridge ? '5-8 minutes' :
                needsBridge ? '3-5 minutes' :
                    needsSwap ? '1-2 minutes' : '30 seconds'
        };
    }, [selectedToken, needsCrossChain, targetChain]);

    const operationPlan = getOperationPlan();

    const handleDeposit = async () => {
        if (!isAuthenticated || !selectedToken || !hasValidAmount || !user?.pkpAddress) {
            toast.error('Please check your connection and token selection');
            return;
        }

        // Check if PKP needs funding
        if (pkpOperations.needsFunding) {
            toast.error(`PKP needs funding. Current: ${pkpOperations.formattedBalance} ETH, Required: ${pkpOperations.minimumBalance} ETH`);
            setShowFundingFlow(true);
            return;
        }

        setIsProcessing(true);

        try {
            const plan = getOperationPlan();
            if (!plan) throw new Error('Unable to create operation plan');

            toast.loading(`Executing ${plan.operations.length} operations via PKP...`);

            if (plan.needsSwap && plan.needsBridge) {
                // Complex operation: Swap + Bridge + Deposit
                console.log('Executing swap + bridge + deposit via PKP');

                await pkpOperations.executeSwapAndDepositWithCheck({
                    fromChain: sourceChain,
                    toChain: targetChain,
                    tokenIn: selectedToken.address,
                    tokenOut: '0x0000000000000000000000000000000000000000', // ETH
                    amountIn: parsedAmount.toString(),
                    vaultAddress: targetContracts.CrashGuardCore,
                });

                toast.dismiss();
                toast.success(`Successfully swapped ${selectedToken.symbol} and deposited to vault!`);

            } else if (plan.needsBridge && !plan.needsSwap) {
                // Bridge + Deposit (same token)
                console.log('Executing bridge + deposit via PKP');

                await pkpOperations.executeSwapAndDepositWithCheck({
                    fromChain: sourceChain,
                    toChain: targetChain,
                    tokenIn: selectedToken.address,
                    tokenOut: selectedToken.address, // Same token
                    amountIn: parsedAmount.toString(),
                    vaultAddress: targetContracts.CrashGuardCore,
                });

                toast.dismiss();
                toast.success(`Successfully bridged and deposited ${selectedToken.symbol}!`);

            } else if (plan.needsSwap && !plan.needsBridge) {
                // Swap + Deposit (same chain)
                console.log('Executing swap + deposit via PKP');

                // First swap to ETH/WETH
                const swapResult = await pkpOperations.executeSwapWithCheck({
                    tokenIn: selectedToken.address,
                    tokenOut: '0x0000000000000000000000000000000000000000', // ETH
                    amountIn: parsedAmount.toString(),
                    minAmountOut: '0', // Should calculate proper slippage
                    recipient: user.pkpAddress,
                    chainId: sourceChain,
                });

                console.log('Swap completed via PKP:', swapResult);

                // Then deposit the received ETH to vault
                await pkpOperations.executeDepositWithCheck({
                    token: '0x0000000000000000000000000000000000000000', // ETH
                    amount: parsedAmount.toString(), // This should be the actual received amount
                    vaultAddress: targetContracts.CrashGuardCore,
                });

                toast.dismiss();
                toast.success(`Successfully swapped ${selectedToken.symbol} to ETH and deposited!`);

            } else {
                // Direct deposit (same chain, compatible token)
                console.log('Executing direct deposit via PKP');

                await pkpOperations.executeDepositWithCheck({
                    token: selectedToken.address,
                    amount: parsedAmount.toString(),
                    vaultAddress: targetContracts.CrashGuardCore,
                });

                toast.dismiss();
                toast.success(`Successfully deposited ${selectedToken.symbol}!`);
            }

            // Reset form and refresh balances
            setAmount('');
            refetchBalance();
            pkpOperations.refetchBalance();

        } catch (error: any) {
            console.error('Deposit operation failed:', error);
            toast.dismiss();

            // Handle specific PKP funding errors
            if (error.message?.includes('PKP needs funding')) {
                setShowFundingFlow(true);
            } else {
                toast.error(`Operation failed: ${error.message}`);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const isLoading = isProcessing || pkpOperations.isExecuting || balanceLoading;

    // Show funding flow if needed
    if (showFundingFlow || (isAuthenticated && isWalletConnected && pkpOperations.needsFunding)) {
        return (
            <PKPFundingFlow
                onFundingComplete={() => {
                    setShowFundingFlow(false);
                    pkpOperations.refetchBalance();
                }}
            />
        );
    }

    if (!isAuthenticated || !isWalletConnected) {
        return (
            <div className="p-8 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm text-center">
                <h3 className="text-xl font-semibold text-white mb-4">
                    Connect Wallet & Vincent
                </h3>
                <div className="space-y-3 text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                        <Wallet className="h-4 w-4" />
                        <span>Step 1: Connect your Web3 wallet</span>
                        {isWalletConnected && <span className="text-green-400">✓</span>}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Shield className="h-4 w-4" />
                        <span>Step 2: Authenticate Vincent</span>
                        {isAuthenticated && <span className="text-green-400">✓</span>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-orange-400" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                    Universal Token Deposit
                </h2>
            </div>

            <div className="space-y-6">
                {/* Token Selection */}
                <UniversalTokenSelector
                    selectedToken={selectedToken}
                    onTokenSelect={setSelectedToken}
                    sourceChain={sourceChain}
                    placeholder="Select any token from your wallet"
                />

                {/* Amount Input */}
                {selectedToken && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Amount to Deposit
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={`0.0 ${selectedToken.symbol}`}
                                className="w-full p-4 pr-20 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors"
                                step="any"
                                min="0"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                {selectedToken.symbol}
                            </div>
                        </div>

                        {/* Balance Display */}
                        {tokenBalance && (
                            <div className="flex justify-between items-center mt-2 text-sm">
                                <span className="text-gray-400">
                                    Available: {selectedToken.isNative
                                        ? formatUnits(BigInt(tokenBalance.nativeBalance), 18)
                                        : formatUnits(BigInt(tokenBalance.tokenBalance || '0'), selectedToken.decimals)
                                    } {selectedToken.symbol}
                                </span>
                                <button
                                    onClick={() => {
                                        const maxAmount = selectedToken.isNative
                                            ? formatUnits(BigInt(tokenBalance.nativeBalance), 18)
                                            : formatUnits(BigInt(tokenBalance.tokenBalance || '0'), selectedToken.decimals);
                                        setAmount(maxAmount);
                                    }}
                                    className="text-orange-400 hover:text-orange-300 transition-colors"
                                >
                                    Max
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Operation Plan */}
                {selectedToken && operationPlan && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="h-4 w-4 text-blue-400" />
                            <h4 className="text-sm font-medium text-blue-400">Operation Plan</h4>
                        </div>

                        <div className="space-y-2">
                            {operationPlan.operations.map((operation, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs text-gray-300">
                                    <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs">
                                        {index + 1}
                                    </div>
                                    <span>{operation}</span>
                                    {index < operationPlan.operations.length - 1 && (
                                        <ArrowRight className="h-3 w-3 text-gray-500" />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 text-xs text-gray-400">
                            Estimated time: {operationPlan.estimatedTime}
                        </div>
                    </div>
                )}

                {/* Validation Messages */}
                {selectedToken && amount && !hasValidAmount && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                            {parsedAmount <= 0
                                ? "Enter a valid amount"
                                : "Insufficient balance"}
                        </span>
                    </div>
                )}

                {/* PKP Status */}
                {pkpOperations.needsFunding && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                            <h4 className="text-sm font-medium text-yellow-400">PKP Needs Funding</h4>
                        </div>
                        <div className="text-xs text-yellow-300/80 mb-3">
                            Your Vincent PKP has {pkpOperations.formattedBalance} ETH but needs at least {pkpOperations.minimumBalance} ETH for operations
                        </div>
                        <button
                            onClick={() => setShowFundingFlow(true)}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                        >
                            Fund PKP Wallet
                        </button>
                    </div>
                )}

                {/* Deposit Button */}
                <button
                    onClick={handleDeposit}
                    disabled={!selectedToken || !hasValidAmount || isLoading || pkpOperations.needsFunding}
                    className="w-full p-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {isProcessing ? "Processing via PKP..." : "Loading..."}
                        </>
                    ) : pkpOperations.needsFunding ? (
                        <>
                            <AlertTriangle className="h-4 w-4" />
                            Fund PKP First
                        </>
                    ) : (
                        <>
                            <Shield className="h-4 w-4" />
                            Deposit {selectedToken?.symbol || "Token"} via PKP
                        </>
                    )}
                </button>

                {/* Success Message */}
                {selectedToken && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-green-400" />
                            <h4 className="text-sm font-medium text-green-400">Crash Protection Active</h4>
                        </div>
                        <div className="text-xs text-green-300/80">
                            Your {selectedToken.symbol} will be protected with 24/7 AI monitoring and automatic emergency responses.
                        </div>
                    </div>
                )}

                {/* PKP Info */}
                <div className="p-4 bg-gray-800/30 rounded-xl">
                    <h4 className="text-sm font-medium text-white mb-2">Vincent PKP Wallet:</h4>
                    <div className="space-y-2 text-xs text-gray-400">
                        <div className="flex justify-between">
                            <span>PKP Address:</span>
                            <span className="font-mono text-orange-400">
                                {pkpOperations.pkpAddress ?
                                    `${pkpOperations.pkpAddress.slice(0, 6)}...${pkpOperations.pkpAddress.slice(-4)}` :
                                    'Not connected'
                                }
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>PKP Balance:</span>
                            <span className={pkpOperations.hasBalance ? 'text-green-400' : 'text-red-400'}>
                                {pkpOperations.formattedBalance} ETH
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Status:</span>
                            <span className={pkpOperations.canExecuteOperations ? 'text-green-400' : 'text-yellow-400'}>
                                {pkpOperations.canExecuteOperations ? 'Ready' :
                                    pkpOperations.needsFunding ? 'Needs Funding' : 'Not Ready'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="p-4 bg-gray-800/30 rounded-xl">
                    <h4 className="text-sm font-medium text-white mb-2">How It Works:</h4>
                    <div className="space-y-1 text-xs text-gray-400">
                        <div>• Your Web3 wallet funds the Vincent PKP wallet</div>
                        <div>• PKP executes all operations automatically (no manual signing)</div>
                        <div>• Cross-chain bridging, swaps, and deposits happen seamlessly</div>
                        <div>• GuardX AI monitors and protects your assets 24/7</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedDepositForm;