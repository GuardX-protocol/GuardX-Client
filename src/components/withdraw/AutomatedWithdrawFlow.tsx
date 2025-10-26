import React, { useState, useCallback, useMemo } from 'react';
import { Loader2, AlertTriangle, Shield, Zap, CheckCircle, TrendingDown } from 'lucide-react';
import { parseUnits } from 'viem';
import toast from 'react-hot-toast';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { useVincentAuth } from '@/components/auth/VincentAuth';
import { usePKPOperations } from '@/hooks/usePKPWallet';
import useVaultBalances from '@/hooks/useVaultBalances';
import { getContracts } from '@/config/contracts';

interface VaultAsset {
    tokenAddress: string;
    symbol: string;
    name: string;
    amount: string;
    formattedAmount: string;
    decimals: number;
    valueUSD: string;
}

interface AutomationStep {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    txHash?: string;
}

const AutomatedWithdrawFlow: React.FC = () => {
    const { signer, walletAddress, isConnected: isWalletConnected } = useWeb3Auth();
    const { isAuthenticated, user, initiateAuth } = useVincentAuth();
    const pkpOperations = usePKPOperations(84532); // Base Sepolia for vault operations

    const [selectedAsset, setSelectedAsset] = useState<VaultAsset | null>(null);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [targetChain, setTargetChain] = useState<number>(84532); // Default to Base Sepolia
    const [isProcessing, setIsProcessing] = useState(false);
    const [automationSteps, setAutomationSteps] = useState<AutomationStep[]>([]);
    const [currentStep, setCurrentStep] = useState<string | null>(null);

    // Get vault balances
    const {
        assets: vaultAssets,
        isLoading: vaultLoading,
    } = useVaultBalances(user?.pkpAddress as `0x${string}`);

    const refetchVaultBalances = () => {
        // Placeholder for refetch functionality
        console.log('Refetching vault balances...');
    };

    const targetContracts = getContracts(84532); // Base Sepolia contracts

    // Parse withdraw amount
    const parsedWithdrawAmount = useMemo(() => {
        if (!withdrawAmount || !selectedAsset) return BigInt(0);
        try {
            return parseUnits(withdrawAmount, selectedAsset.decimals);
        } catch {
            return BigInt(0);
        }
    }, [withdrawAmount, selectedAsset]);

    // Check if user has sufficient vault balance
    const hasValidWithdrawAmount = useMemo(() => {
        if (!selectedAsset || parsedWithdrawAmount <= 0) return false;
        const availableAmount = BigInt(selectedAsset.amount);
        return parsedWithdrawAmount <= availableAmount;
    }, [selectedAsset, parsedWithdrawAmount]);

    // Calculate required PKP funding for withdrawal operations
    const calculatePKPFunding = useCallback(() => {
        const needsBridge = targetChain !== 84532;
        const needsSwap = selectedAsset?.symbol !== 'ETH' && selectedAsset?.symbol !== 'WETH';

        if (needsBridge && needsSwap) {
            return '0.008'; // Complex operations
        } else if (needsBridge || needsSwap) {
            return '0.005'; // Medium operations
        } else {
            return '0.002'; // Simple withdrawal
        }
    }, [selectedAsset, targetChain]);

    // Update automation step status
    const updateStep = useCallback((stepId: string, status: AutomationStep['status'], txHash?: string) => {
        setAutomationSteps(prev => prev.map(step => 
            step.id === stepId ? { ...step, status, txHash } : step
        ));
    }, []);

    // Initialize automation steps for withdrawal
    const initializeWithdrawSteps = useCallback(() => {
        if (!selectedAsset) return;

        const needsBridge = targetChain !== 84532;
        const needsSwap = selectedAsset.symbol !== 'ETH' && selectedAsset.symbol !== 'WETH';

        const steps: AutomationStep[] = [];

        // Always need to fund PKP for gas
        if (pkpOperations.needsFunding) {
            steps.push({
                id: 'fund-pkp',
                title: 'Fund PKP Wallet',
                description: `Transfer ${calculatePKPFunding()} ETH to Vincent PKP for gas fees`,
                status: 'pending'
            });
        }

        // Withdraw from vault
        steps.push({
            id: 'withdraw-vault',
            title: 'Withdraw from Vault',
            description: `Withdraw ${selectedAsset.symbol} from GuardX vault`,
            status: 'pending'
        });

        // Optional: Swap to desired token
        if (needsSwap) {
            steps.push({
                id: 'swap-token',
                title: 'Swap Token',
                description: `Swap ${selectedAsset.symbol} to desired token`,
                status: 'pending'
            });
        }

        // Optional: Bridge to target chain
        if (needsBridge) {
            steps.push({
                id: 'bridge-token',
                title: 'Bridge to Target Chain',
                description: `Bridge to target chain`,
                status: 'pending'
            });
        }

        // Final transfer to user's EOA
        steps.push({
            id: 'transfer-eoa',
            title: 'Transfer to Your Wallet',
            description: 'Transfer assets to your connected wallet',
            status: 'pending'
        });

        setAutomationSteps(steps);
    }, [selectedAsset, targetChain, pkpOperations.needsFunding, calculatePKPFunding]);

    // Execute automated withdrawal flow
    const handleAutomatedWithdraw = async () => {
        if (!isWalletConnected || !isAuthenticated || !selectedAsset || !hasValidWithdrawAmount || !signer || !user?.pkpAddress) {
            toast.error('Please check your connection and withdrawal details');
            return;
        }

        setIsProcessing(true);
        initializeWithdrawSteps();

        try {
            toast.loading('Starting automated withdrawal flow...');

            // Step 1: Fund PKP if needed
            if (pkpOperations.needsFunding) {
                setCurrentStep('fund-pkp');
                updateStep('fund-pkp', 'processing');

                const fundingAmount = calculatePKPFunding();
                const fundingAmountWei = parseUnits(fundingAmount, 18);

                console.log('Auto-funding PKP for withdrawal:', {
                    from: walletAddress,
                    to: user.pkpAddress,
                    amount: fundingAmount
                });

                const fundingTx = await signer.sendTransaction({
                    to: user.pkpAddress,
                    value: fundingAmountWei.toString(),
                });

                await fundingTx.wait();
                updateStep('fund-pkp', 'completed', fundingTx.hash);

                // Wait for balance update
                await new Promise(resolve => setTimeout(resolve, 3000));
                pkpOperations.refetchBalance();
            }

            toast.dismiss();
            toast.loading('PKP executing withdrawal operations...');

            // Step 2: Withdraw from vault
            setCurrentStep('withdraw-vault');
            updateStep('withdraw-vault', 'processing');

            console.log('Executing automated vault withdrawal via PKP');

            const withdrawResult = await pkpOperations.executeWithdrawWithCheck({
                token: selectedAsset.tokenAddress,
                amount: parsedWithdrawAmount.toString(),
                vaultAddress: targetContracts.CrashGuardCore,
            });

            updateStep('withdraw-vault', 'completed', withdrawResult.transactionHash);

            // Step 3: Handle cross-chain and swapping if needed
            const needsBridge = targetChain !== 84532;
            const needsSwap = selectedAsset.symbol !== 'ETH' && selectedAsset.symbol !== 'WETH';

            if (needsBridge || needsSwap) {
                if (needsSwap) {
                    setCurrentStep('swap-token');
                    updateStep('swap-token', 'processing');

                    // Swap to ETH for easier bridging
                    const swapResult = await pkpOperations.executeSwapWithCheck({
                        tokenIn: selectedAsset.tokenAddress,
                        tokenOut: '0x0000000000000000000000000000000000000000', // ETH
                        amountIn: parsedWithdrawAmount.toString(),
                        minAmountOut: '0',
                        recipient: user.pkpAddress,
                        chainId: 84532,
                    });

                    updateStep('swap-token', 'completed', swapResult.transactionHash);
                }

                if (needsBridge) {
                    setCurrentStep('bridge-token');
                    updateStep('bridge-token', 'processing');

                    // Bridge to target chain
                    const bridgeResult = await pkpOperations.executeBridgeWithCheck({
                        fromChain: 84532, // Base Sepolia
                        toChain: targetChain,
                        token: '0x0000000000000000000000000000000000000000', // ETH
                        amount: parsedWithdrawAmount.toString(),
                        recipient: user.pkpAddress,
                    });

                    updateStep('bridge-token', 'completed', bridgeResult.bridgeTransactionHash);
                }
            }

            // Step 4: Transfer to user's EOA
            setCurrentStep('transfer-eoa');
            updateStep('transfer-eoa', 'processing');

            console.log('Transferring assets from PKP to user EOA');

            // Transfer from PKP to user's EOA
            const transferResult = await pkpOperations.executeTokenTransferWithCheck({
                token: needsSwap ? '0x0000000000000000000000000000000000000000' : selectedAsset.tokenAddress,
                to: walletAddress,
                amount: parsedWithdrawAmount.toString(),
            });

            updateStep('transfer-eoa', 'completed', transferResult.transactionHash);

            setCurrentStep(null);
            toast.dismiss();
            toast.success(`Automated withdrawal completed! ${selectedAsset.symbol} transferred to your wallet.`);

            // Reset form and refresh balances
            setWithdrawAmount('');
            setSelectedAsset(null);
            refetchVaultBalances();
            pkpOperations.refetchBalance();

        } catch (error: any) {
            console.error('Automated withdrawal failed:', error);
            toast.dismiss();

            // Update current step as error
            if (currentStep) {
                updateStep(currentStep, 'error');
            }

            toast.error(`Automated withdrawal failed: ${error.message}`);
        } finally {
            setIsProcessing(false);
            setCurrentStep(null);
        }
    };

    const isLoading = isProcessing || pkpOperations.isExecuting || vaultLoading;

    // Authentication check
    if (!isWalletConnected) {
        return (
            <div className="p-8 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm text-center">
                <h3 className="text-xl font-semibold text-white mb-4">
                    Connect Your Wallet
                </h3>
                <p className="text-gray-400 mb-6">
                    Connect your Web3 wallet to start automated withdrawals
                </p>
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
                    Authenticate Vincent to enable automated withdrawals
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
                <TrendingDown className="h-6 w-6 text-red-400" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    Automated Withdrawal
                </h2>
            </div>

            <div className="space-y-6">
                {/* Vault Assets Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Select Asset to Withdraw
                    </label>
                    
                    {vaultLoading ? (
                        <div className="p-4 bg-gray-800/50 rounded-xl">
                            <div className="animate-pulse flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                                </div>
                            </div>
                        </div>
                    ) : vaultAssets.length === 0 ? (
                        <div className="p-4 bg-gray-800/50 rounded-xl text-center">
                            <p className="text-gray-400">No assets in vault to withdraw</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {vaultAssets.map((asset) => (
                                <button
                                    key={asset.tokenAddress}
                                    onClick={() => setSelectedAsset({
                                        tokenAddress: asset.tokenAddress,
                                        symbol: asset.symbol,
                                        name: asset.name,
                                        amount: asset.amount.toString(),
                                        formattedAmount: asset.formattedAmount,
                                        decimals: asset.decimals,
                                        valueUSD: asset.valueUSD.toString()
                                    })}
                                    className={`w-full p-4 rounded-xl border transition-all text-left ${
                                        selectedAsset?.tokenAddress === asset.tokenAddress
                                            ? 'border-red-500 bg-red-500/10'
                                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                                    }`}
                                    disabled={isProcessing}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-medium text-white">{asset.symbol}</div>
                                            <div className="text-xs text-gray-400">{asset.name}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-white">
                                                {parseFloat(asset.formattedAmount).toFixed(6)}
                                            </div>
                                            <div className="text-xs text-gray-400">{asset.symbol}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Withdraw Amount Input */}
                {selectedAsset && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Amount to Withdraw
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                placeholder={`0.0 ${selectedAsset.symbol}`}
                                className="w-full p-4 pr-20 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                                step="any"
                                min="0"
                                max={selectedAsset.formattedAmount}
                                disabled={isProcessing}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                {selectedAsset.symbol}
                            </div>
                        </div>

                        {/* Balance Display */}
                        <div className="flex justify-between items-center mt-2 text-sm">
                            <span className="text-gray-400">
                                Available: {selectedAsset.formattedAmount} {selectedAsset.symbol}
                            </span>
                            <button
                                onClick={() => setWithdrawAmount(selectedAsset.formattedAmount)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                disabled={isProcessing}
                            >
                                Max
                            </button>
                        </div>
                    </div>
                )}

                {/* Target Chain Selection */}
                {selectedAsset && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            Target Chain (Optional)
                        </label>
                        <select
                            value={targetChain}
                            onChange={(e) => setTargetChain(Number(e.target.value))}
                            className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-red-500 focus:outline-none transition-colors"
                            disabled={isProcessing}
                        >
                            <option value={84532}>Base Sepolia (Same Chain)</option>
                            <option value={421614}>Arbitrum Sepolia</option>
                            <option value={11155111}>Ethereum Sepolia</option>
                        </select>
                    </div>
                )}

                {/* Automation Steps Progress */}
                {isProcessing && automationSteps.length > 0 && (
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                        <h4 className="text-sm font-medium text-white mb-3">Withdrawal Progress</h4>
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
                                            <div className="text-xs text-blue-400 font-mono">
                                                TX: {step.txHash.slice(0, 10)}...{step.txHash.slice(-8)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Validation Messages */}
                {selectedAsset && withdrawAmount && !hasValidWithdrawAmount && !isProcessing && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span>
                            {parsedWithdrawAmount <= 0
                                ? "Enter a valid amount"
                                : "Amount exceeds available balance"}
                        </span>
                    </div>
                )}

                {/* Automated Withdraw Button */}
                <button
                    onClick={handleAutomatedWithdraw}
                    disabled={!selectedAsset || !hasValidWithdrawAmount || isLoading}
                    className="w-full p-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {isProcessing ? "Automating..." : "Loading..."}
                        </>
                    ) : (
                        <>
                            <Zap className="h-4 w-4" />
                            Start Automated Withdrawal
                        </>
                    )}
                </button>

                {/* Info */}
                <div className="p-4 bg-gray-800/30 rounded-xl">
                    <h4 className="text-sm font-medium text-white mb-2">Automated Withdrawal Process:</h4>
                    <div className="space-y-1 text-xs text-gray-400">
                        <div>• System automatically funds PKP for gas fees if needed</div>
                        <div>• PKP withdraws assets from GuardX vault</div>
                        <div>• Optional: Swap tokens and bridge to target chain</div>
                        <div>• Final transfer to your connected wallet - all automated!</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutomatedWithdrawFlow;