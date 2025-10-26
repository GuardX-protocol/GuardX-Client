import React, { useState, useCallback, useMemo } from 'react';
import { ArrowRight, Loader2, AlertTriangle, Shield, Zap, CheckCircle } from 'lucide-react';
import { parseUnits, formatUnits } from 'viem';
import toast from 'react-hot-toast';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { useVincentAuth } from '@/components/auth/VincentAuth';
import { usePKPOperations } from '@/hooks/usePKPWallet';
import { useWalletTokenBalance } from '@/hooks/useWalletTokenBalance';
import { useRealDeposit } from '@/hooks/useRealDeposit';
import UniversalTokenSelector from './UniversalTokenSelector';
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

interface AutomationStep {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    txHash?: string;
}

const AutomatedDepositFlow: React.FC = () => {
    const { signer, isConnected: isWalletConnected, chainId } = useWeb3Auth();
    const { isAuthenticated, user, initiateAuth } = useVincentAuth();
    const pkpOperations = usePKPOperations(84532); // Base Sepolia for vault operations
    const realDeposit = useRealDeposit();

    const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null);
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [automationSteps, setAutomationSteps] = useState<AutomationStep[]>([]);
    const [currentStep, setCurrentStep] = useState<string | null>(null);

    // Determine chains and operations needed
    const sourceChain = chainId || 421614; // User's current chain
    const targetChain = getTargetChainForDeposit(sourceChain); // Base Sepolia (where vault is)
    const needsCrossChain = needsCrossChainOperation(sourceChain, targetChain);
    const targetContracts = getContracts(targetChain);

    // Get balance for selected token on user's current chain
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

    // Calculate required PKP funding (gas estimation)
    const calculatePKPFunding = useCallback(() => {
        if (!selectedToken) return '0.005'; // Default 0.005 ETH

        const plan = getOperationPlan();
        if (!plan) return '0.005';

        // Estimate gas needed based on operations
        if (plan.needsSwap && plan.needsBridge) {
            return '0.01'; // Complex operations need more gas
        } else if (plan.needsBridge || plan.needsSwap) {
            return '0.007'; // Medium operations
        } else {
            return '0.003'; // Simple deposit
        }
    }, [selectedToken]);

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
                'Fund PKP Wallet',
                needsSwap && 'Swap to ETH/WETH',
                needsBridge && `Bridge to ${getChainName(targetChain)}`,
                'Deposit to Vault'
            ].filter(Boolean),
            estimatedTime: needsSwap && needsBridge ? '8-12 minutes' :
                needsBridge ? '5-8 minutes' :
                    needsSwap ? '3-5 minutes' : '2-3 minutes'
        };
    }, [selectedToken, needsCrossChain, targetChain]);

    const operationPlan = getOperationPlan();

    // Update automation step status
    const updateStep = useCallback((stepId: string, status: AutomationStep['status'], txHash?: string) => {
        setAutomationSteps(prev => prev.map(step => 
            step.id === stepId ? { ...step, status, txHash } : step
        ));
    }, []);

    // Initialize automation steps
    const initializeSteps = useCallback(() => {
        if (!operationPlan) return;

        const steps: AutomationStep[] = [
            {
                id: 'fund-pkp',
                title: 'Fund PKP Wallet',
                description: `Transfer ${calculatePKPFunding()} ETH to Vincent PKP for gas fees`,
                status: 'pending'
            }
        ];

        if (operationPlan.needsSwap) {
            steps.push({
                id: 'swap-token',
                title: 'Swap Token',
                description: `Swap ${selectedToken?.symbol} to ETH/WETH`,
                status: 'pending'
            });
        }

        if (operationPlan.needsBridge) {
            steps.push({
                id: 'bridge-token',
                title: 'Bridge to Target Chain',
                description: `Bridge to ${getChainName(targetChain)}`,
                status: 'pending'
            });
        }

        steps.push({
            id: 'deposit-vault',
            title: 'Deposit to Vault',
            description: 'Deposit assets to GuardX vault with AI protection',
            status: 'pending'
        });

        setAutomationSteps(steps);
    }, [operationPlan, selectedToken, calculatePKPFunding, targetChain]);

    // Execute automated deposit flow
    const handleAutomatedDeposit = async () => {
        if (!isWalletConnected || !isAuthenticated || !selectedToken || !hasValidAmount || !signer || !user?.pkpAddress) {
            toast.error('Please check your connection and token selection');
            return;
        }

        setIsProcessing(true);
        initializeSteps();

        try {
            const plan = getOperationPlan();
            if (!plan) throw new Error('Unable to create operation plan');

            toast.loading('Starting automated deposit flow...');

            // Step 1: Fund PKP Wallet automatically (if cross-chain) or direct deposit (if same-chain)
            if (needsCrossChain) {
                setCurrentStep('fund-pkp');
                updateStep('fund-pkp', 'processing');

                const fundingAmount = calculatePKPFunding();
                
                // Use real PKP funding
                const fundingTxHash = await realDeposit.executePKPFunding(
                    user.pkpAddress as `0x${string}`,
                    fundingAmount
                );

                updateStep('fund-pkp', 'completed', fundingTxHash);
            } else {
                // Same chain - skip PKP funding and go directly to deposit
                setCurrentStep('deposit-vault');
                updateStep('deposit-vault', 'processing');

                const depositResult = await realDeposit.executeSameChainDeposit({
                    tokenAddress: selectedToken.address as `0x${string}`,
                    amount,
                    decimals: selectedToken.decimals,
                    isNative: selectedToken.isNative,
                    vaultChain: targetChain,
                });

                updateStep('deposit-vault', 'completed', depositResult.transactionHash);
                
                setCurrentStep(null);
                toast.dismiss();
                toast.success(`Deposit completed! ${selectedToken.symbol} is now protected in GuardX vault.`);

                // Reset form and refresh balances
                setAmount('');
                refetchBalance();
                pkpOperations.refetchBalance();
                return;
            }

            // Wait a moment for balance to update
            await new Promise(resolve => setTimeout(resolve, 3000));
            pkpOperations.refetchBalance();

            toast.dismiss();
            toast.loading('PKP funded! Vincent will handle cross-chain operations...');

            // Step 2-4: Execute operations via PKP
            if (plan.needsSwap && plan.needsBridge) {
                // Complex operation: Swap + Bridge + Deposit
                setCurrentStep('swap-token');
                updateStep('swap-token', 'processing');

                const result = await pkpOperations.executeSwapAndDepositWithCheck({
                    fromChain: sourceChain,
                    toChain: targetChain,
                    tokenIn: selectedToken.address,
                    tokenOut: '0x0000000000000000000000000000000000000000', // ETH
                    amountIn: parsedAmount.toString(),
                    vaultAddress: targetContracts.CrashGuardCore,
                });
                
                // Update steps with actual transaction hashes
                updateStep('swap-token', 'completed', result.swapTransactionHash || result.transactionHash);
                setCurrentStep('bridge-token');
                updateStep('bridge-token', 'processing');
                
                // Simulate bridge completion after a delay
                setTimeout(() => {
                    updateStep('bridge-token', 'completed', result.bridgeTransactionHash);
                    setCurrentStep('deposit-vault');
                    updateStep('deposit-vault', 'processing');
                    
                    // Simulate deposit completion
                    setTimeout(() => {
                        updateStep('deposit-vault', 'completed', result.depositTxHash);
                        setCurrentStep(null);
                    }, 1000);
                }, 2000);

            } else if (plan.needsBridge && !plan.needsSwap) {
                // Bridge + Deposit (same token)
                setCurrentStep('bridge-token');
                updateStep('bridge-token', 'processing');

                const result = await pkpOperations.executeSwapAndDepositWithCheck({
                    fromChain: sourceChain,
                    toChain: targetChain,
                    tokenIn: selectedToken.address,
                    tokenOut: selectedToken.address, // Same token
                    amountIn: parsedAmount.toString(),
                    vaultAddress: targetContracts.CrashGuardCore,
                });
                
                updateStep('bridge-token', 'completed', result.bridgeTransactionHash);
                setCurrentStep('deposit-vault');
                updateStep('deposit-vault', 'processing');
                
                // Simulate deposit completion
                setTimeout(() => {
                    updateStep('deposit-vault', 'completed', result.depositTxHash);
                    setCurrentStep(null);
                }, 1000);

            } else if (plan.needsSwap && !plan.needsBridge) {
                // Swap + Deposit (same chain)
                setCurrentStep('swap-token');
                updateStep('swap-token', 'processing');

                const swapResult = await pkpOperations.executeSwapWithCheck({
                    tokenIn: selectedToken.address,
                    tokenOut: '0x0000000000000000000000000000000000000000', // ETH
                    amountIn: parsedAmount.toString(),
                    minAmountOut: '0',
                    recipient: user.pkpAddress,
                    chainId: sourceChain,
                });
                updateStep('swap-token', 'completed', swapResult.swapTransactionHash || swapResult.transactionHash);

                setCurrentStep('deposit-vault');
                updateStep('deposit-vault', 'processing');

                const depositResult = await pkpOperations.executeDepositWithCheck({
                    token: '0x0000000000000000000000000000000000000000', // ETH
                    amount: swapResult.amountOut || parsedAmount.toString(),
                    vaultAddress: targetContracts.CrashGuardCore,
                });


                updateStep('deposit-vault', 'completed', depositResult.depositTransactionHash || depositResult.transactionHash);

            } else {
                // Direct deposit (same chain, compatible token)
                setCurrentStep('deposit-vault');
                updateStep('deposit-vault', 'processing');

                const result = await pkpOperations.executeDepositWithCheck({
                    token: selectedToken.address,
                    amount: parsedAmount.toString(),
                    vaultAddress: targetContracts.CrashGuardCore,
                });
                updateStep('deposit-vault', 'completed', result.depositTransactionHash || result.transactionHash);
            }

            setCurrentStep(null);
            toast.dismiss();
            toast.success(`Automated deposit completed! ${selectedToken.symbol} is now protected in GuardX vault.`);

            // Reset form and refresh balances
            setAmount('');
            refetchBalance();
            pkpOperations.refetchBalance();

        } catch (error: any) {
            console.error('Automated deposit failed:', error);
            toast.dismiss();

            // Update current step as error
            if (currentStep) {
                updateStep(currentStep, 'error');
            }

            toast.error(`Automated deposit failed: ${error.message}`);
        } finally {
            setIsProcessing(false);
            setCurrentStep(null);
        }
    };

    const isLoading = isProcessing || pkpOperations.isExecuting || balanceLoading || realDeposit.isExecuting;

    // Authentication check
    if (!isWalletConnected) {
        return (
            <div className="p-8 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm text-center">
                <h3 className="text-xl font-semibold text-white mb-4">
                    Connect Your Wallet
                </h3>
                <p className="text-gray-400 mb-6">
                    Connect your Web3 wallet to start automated deposits
                </p>
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <h4 className="text-sm font-medium text-blue-400 mb-2">Fully Automated Process:</h4>
                    <div className="text-sm text-blue-300/80 space-y-1">
                        <div>1. Connect wallet → Authenticate Vincent</div>
                        <div>2. Select token → Enter amount</div>
                        <div>3. Click deposit → Everything happens automatically</div>
                        <div>4. PKP funding, swaps, bridges, deposits - all seamless!</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="p-8 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm text-center">
                <h3 className="text-xl font-semibold text-white mb-4">
                    Authenticate Vincent
                </h3>
                <p className="text-gray-400 mb-6">
                    Authenticate Vincent to enable automated cross-chain operations
                </p>
                <button
                    onClick={initiateAuth}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                    <Shield className="h-4 w-4" />
                    Authenticate Vincent
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
                <Zap className="h-6 w-6 text-orange-400" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                    Automated Deposit
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
                                disabled={isProcessing}
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
                                    disabled={isProcessing}
                                >
                                    Max
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Automation Plan */}
                {selectedToken && operationPlan && !isProcessing && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="h-4 w-4 text-blue-400" />
                            <h4 className="text-sm font-medium text-blue-400">Automated Process</h4>
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
                            Estimated time: {operationPlan.estimatedTime} • PKP funding: {calculatePKPFunding()} ETH
                        </div>
                    </div>
                )}

                {/* Automation Steps Progress */}
                {isProcessing && automationSteps.length > 0 && (
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                        <h4 className="text-sm font-medium text-white mb-3">Automation Progress</h4>
                        <div className="space-y-3">
                            {automationSteps.map((step) => (
                                <div key={step.id} className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                        step.status === 'completed' ? 'bg-green-500' :
                                        step.status === 'processing' ? 'bg-blue-500' :
                                        step.status === 'error' ? 'bg-red-500' :
                                        'bg-gray-600'
                                    }`}>
                                        {step.status === 'completed' ? (
                                            <CheckCircle className="h-3 w-3 text-white" />
                                        ) : step.status === 'processing' ? (
                                            <Loader2 className="h-3 w-3 text-white animate-spin" />
                                        ) : step.status === 'error' ? (
                                            <AlertTriangle className="h-3 w-3 text-white" />
                                        ) : (
                                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-white">{step.title}</div>
                                        <div className="text-xs text-gray-400">{step.description}</div>
                                        {step.txHash && (
                                            <a
                                                href={`https://sepolia.arbiscan.io/tx/${step.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-400 hover:text-blue-300 font-mono underline transition-colors inline-flex items-center gap-1"
                                            >
                                                TX: {step.txHash.slice(0, 10)}...{step.txHash.slice(-8)} ↗
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Validation Messages */}
                {selectedToken && amount && !hasValidAmount && !isProcessing && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                            {parsedAmount <= 0
                                ? "Enter a valid amount"
                                : "Insufficient balance"}
                        </span>
                    </div>
                )}

                {/* Automated Deposit Button */}
                <button
                    onClick={handleAutomatedDeposit}
                    disabled={!selectedToken || !hasValidAmount || isLoading}
                    className="w-full p-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {isProcessing ? "Automating..." : "Loading..."}
                        </>
                    ) : (
                        <>
                            <Zap className="h-4 w-4" />
                            Start Automated Deposit
                        </>
                    )}
                </button>

                {/* Info */}
                <div className="p-4 bg-gray-800/30 rounded-xl">
                    <h4 className="text-sm font-medium text-white mb-2">Real Blockchain Transactions:</h4>
                    <div className="space-y-1 text-xs text-gray-400">
                        <div>• Same-chain deposits: Direct wallet transactions (requires signing)</div>
                        <div>• Cross-chain deposits: PKP funding + Vincent automation</div>
                        <div>• All transactions are real and will be recorded on-chain</div>
                        <div>• Your wallet will prompt for transaction approval</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutomatedDepositFlow;