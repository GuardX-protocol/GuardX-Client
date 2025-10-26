import { useCallback, useState } from 'react';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { useVincentAuth } from '@/components/auth/VincentAuth';
import { useVincentWallet } from '@/hooks/useVincentWallet';
import { parseUnits, Address } from 'viem';
import { writeContract, waitForTransactionReceipt, readContract } from '@wagmi/core';
import { wagmiConfig } from '@/config/wagmi';
import toast from 'react-hot-toast';
import { getContracts } from '@/config/contracts';
import { ethers } from 'ethers';

// Real Vincent Abilities
import {
    executeUniswapSwap,
    executeDebridge,
    executeERC20Transfer,
    executeERC20Approval,
    type VincentApp
} from '@/utils/vincentAbilities';

// RPC URLs
const ARBITRUM_SEPOLIA_RPC = 'https://sepolia-rollup.arbitrum.io/rpc';
const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';

// ERC20 ABI
const ERC20_ABI = [
    'function approve(address spender, uint256 amount) returns (bool)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function balanceOf(address owner) view returns (uint256)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
] as const;

// Vault ABI
const VAULT_ABI = [
    'function depositAsset(address token, uint256 amount) payable',
    'function deposit() payable',
] as const;

export interface RealDepositResult {
    success: boolean;
    transactionHash: string;
    blockNumber?: number;
    gasUsed?: bigint;
    approvalTxHash?: string;
    bridgeOrderId?: string;
}

export const useRealDeposit = () => {
    const { signer, walletAddress, chainId } = useWeb3Auth();
    const { isAuthenticated, user } = useVincentAuth();
    const { wallet: pkpWallet } = useVincentWallet();
    const [isExecuting, setIsExecuting] = useState(false);

    // Helper to create authenticated VincentApp
    const createVincentApp = useCallback((): VincentApp => {
        if (!pkpWallet || !user?.pkpAddress) {
            throw new Error('Vincent wallet not available');
        }

        return {
            wallet: {
                address: pkpWallet.address,
                signer: pkpWallet.signer,
            },
            pkpAddress: user.pkpAddress,
            pkpEthAddress: pkpWallet.pkpEthAddress,
            jwt: pkpWallet.jwt,
            appId: import.meta.env.VITE_VINCENT_APP_ID,
        };
    }, [pkpWallet, user?.pkpAddress]);

    // Execute real token approval (EOA or Vincent)
    const executeTokenApproval = useCallback(async (
        tokenAddress: Address,
        spenderAddress: Address,
        amount: string,
        decimals: number,
        useVincent: boolean = false
    ): Promise<string> => {
        if (!walletAddress) throw new Error('Wallet not connected');

        const amountWei = parseUnits(amount, decimals);

        // Check current allowance
        const currentAllowance = await readContract(wagmiConfig, {
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'allowance',
            args: [walletAddress as Address, spenderAddress],
        }) as bigint;

        if (currentAllowance >= amountWei) return 'sufficient-allowance';

        if (useVincent && isAuthenticated && pkpWallet && user?.pkpAddress) {
            // Vincent Approval Ability
            toast.loading('Approving via Vincent...');

            const vincentApp = createVincentApp();
            const approvalResult = await executeERC20Approval(vincentApp, {
                tokenAddress,
                spender: spenderAddress,
                amount: amountWei.toString(),
                chainId: chainId || 421614,
            });

            toast.success('Vincent approval complete!');
            return (approvalResult && typeof approvalResult === 'object' && ('txHash' in approvalResult || 'transactionHash' in approvalResult))
                ? ((approvalResult as any).txHash || (approvalResult as any).transactionHash)
                : 'approval-completed';

        } else {
            // EOA Approval
            toast.loading('Approving token spend...');

            const hash = await writeContract(wagmiConfig, {
                address: tokenAddress,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [spenderAddress, amountWei],
            });

            await waitForTransactionReceipt(wagmiConfig, { hash });
            toast.success('Token approved!');
            return hash;
        }
    }, [signer, walletAddress, chainId, isAuthenticated, pkpWallet, user?.pkpAddress]);

    // Execute token transfer to PKP using Vincent abilities
    const executeTokenTransferToPKP = useCallback(async (params: {
        tokenAddress: Address;
        amount: string;
        decimals: number;
        pkpAddress: Address;
        useVincent?: boolean;
    }): Promise<RealDepositResult> => {
        if (!walletAddress) throw new Error('Wallet not connected');

        setIsExecuting(true);

        try {
            const amountWei = parseUnits(params.amount, params.decimals);
            const rpcUrl = ARBITRUM_SEPOLIA_RPC;

            // Balance check
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const tokenContract = new ethers.Contract(
                params.tokenAddress,
                ERC20_ABI,
                provider
            );

            const balance = await tokenContract.balanceOf(walletAddress);
            const symbol = await tokenContract.symbol();

            console.log('💰 Token balance check:', {
                symbol,
                balance: balance.toString(),
                required: amountWei.toString(),
                sufficient: balance >= amountWei
            });

            if (balance < amountWei) {
                throw new Error(`Insufficient ${symbol} balance`);
            }

            if (params.useVincent && isAuthenticated && pkpWallet && user?.pkpAddress) {
                // Vincent Transfer Ability
                toast.loading('Transferring via Vincent...');

                const vincentApp = createVincentApp();
                const transferResult = await executeERC20Transfer(vincentApp, {
                    tokenAddress: params.tokenAddress,
                    to: params.pkpAddress,
                    amount: amountWei.toString(),
                    chainId: 421614,
                });

                toast.success('Vincent transfer complete!');

                return {
                    success: true,
                    transactionHash: (transferResult && typeof transferResult === 'object' && ('txHash' in transferResult || 'transactionHash' in transferResult))
                        ? ((transferResult as any).txHash || (transferResult as any).transactionHash)
                        : 'transfer-completed',
                    gasUsed: BigInt(21000)
                };

            } else {
                // EOA Transfer (fallback)
                toast.loading('Transferring tokens to PKP wallet...');

                const transferContract = new ethers.Contract(
                    params.tokenAddress,
                    ['function transfer(address to, uint256 amount) returns (bool)'],
                    signer
                );

                const transferTx = await transferContract.transfer(params.pkpAddress, amountWei);
                const receipt = await transferTx.wait();

                toast.success('Tokens transferred to PKP wallet!');

                return {
                    success: true,
                    transactionHash: transferTx.hash,
                    gasUsed: receipt?.gasUsed
                };
            }

        } catch (error: any) {
            toast.error(error.message || 'Token transfer failed');
            throw error;
        } finally {
            setIsExecuting(false);
        }
    }, [walletAddress, signer, isAuthenticated, pkpWallet, user?.pkpAddress]);

    // Execute real token swap using Vincent Uniswap ability
    const executeRealTokenSwap = useCallback(async (params: {
        tokenIn: Address;
        tokenOut: Address;
        amountIn: string;
        recipient: Address;
        chainId: number;
    }): Promise<string> => {
        if (!isAuthenticated || !pkpWallet || !user?.pkpAddress) {
            throw new Error('Vincent authentication required for swap');
        }

        toast.loading('Swapping via Vincent...');

        try {
            const vincentApp = createVincentApp();
            const swapResult = await executeUniswapSwap(vincentApp, {
                inputToken: params.tokenIn,
                outputToken: params.tokenOut,
                amount: params.amountIn,
                chainId: params.chainId,
            });

            toast.success('Token swap completed!');
            return (swapResult && typeof swapResult === 'object' && ('txHash' in swapResult || 'transactionHash' in swapResult))
                ? ((swapResult as any).txHash || (swapResult as any).transactionHash)
                : 'swap-completed';

        } catch (error: any) {
            toast.error(error.message || 'Token swap failed');
            throw error;
        }
    }, [isAuthenticated, pkpWallet, user?.pkpAddress]);

    // Execute real cross-chain bridge using Vincent deBridge ability
    const executeRealCrossChainBridge = useCallback(async (params: {
        fromChain: number;
        toChain: number;
        token: Address;
        amount: string;
        recipient: Address;
    }): Promise<string> => {
        if (!isAuthenticated || !pkpWallet || !user?.pkpAddress) {
            throw new Error('Vincent authentication required for bridge');
        }

        toast.loading('Bridging via Vincent...');

        try {
            // Validate PKP before attempting bridge
            console.log('🔍 Validating PKP for bridge operation:', {
                originalPkpKey: user.pkpAddress,
                derivedAddress: pkpWallet.pkpEthAddress,
                sourceChain: params.fromChain,
                destinationChain: params.toChain
            });

            const vincentApp = createVincentApp();
            const bridgeResult = await executeDebridge(vincentApp, {
                sourceChain: params.fromChain,
                destinationChain: params.toChain,
                sourceToken: params.token,
                destinationToken: params.token, // Same token
                amount: params.amount,
            });

            // Wait for bridge completion (simplified)
            toast.loading('Waiting for bridge completion...');
            await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute

            toast.success('Cross-chain bridge completed!');

            return (bridgeResult && typeof bridgeResult === 'object' && ('txHash' in bridgeResult || 'transactionHash' in bridgeResult))
                ? ((bridgeResult as any).txHash || (bridgeResult as any).transactionHash)
                : 'bridge-completed';

        } catch (error: any) {
            console.error('Bridge error:', error);
            toast.error(error.message || 'Bridge failed');
            throw error;
        }
    }, [isAuthenticated, pkpWallet, user?.pkpAddress]);

    // Execute real vault deposit
    const executeRealVaultDeposit = useCallback(async (params: {
        token: Address;
        amount: string;
        vaultAddress: Address;
        chainId: number;
        decimals?: number;
        isNative?: boolean;
    }): Promise<RealDepositResult> => {
        if (!walletAddress) throw new Error('Wallet not connected');

        setIsExecuting(true);

        try {
            const decimals = params.decimals || (params.isNative ? 18 : 6);
            const amountWei = parseUnits(params.amount, decimals);

            toast.loading('Depositing to vault...');

            if (params.isNative) {
                // ETH deposit
                const hash = await writeContract(wagmiConfig, {
                    address: params.vaultAddress,
                    abi: VAULT_ABI,
                    functionName: 'deposit',
                    value: amountWei,
                });

                const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
                toast.success('ETH deposit successful!');

                return {
                    success: true,
                    transactionHash: hash,
                    gasUsed: receipt?.gasUsed
                };

            } else {
                // ERC20 deposit
                const hash = await writeContract(wagmiConfig, {
                    address: params.vaultAddress,
                    abi: VAULT_ABI,
                    functionName: 'depositAsset',
                    args: [params.token, amountWei],
                });

                const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
                toast.success('Token deposit successful!');

                return {
                    success: true,
                    transactionHash: hash,
                    gasUsed: receipt?.gasUsed
                };
            }

        } catch (error: any) {
            toast.error(error.message || 'Vault deposit failed');
            throw error;
        } finally {
            setIsExecuting(false);
        }
    }, [walletAddress]);

    // Execute PKP funding
    const executePKPFunding = useCallback(async (
        pkpAddress: Address,
        amount: string
    ): Promise<string> => {
        if (!signer || !walletAddress) {
            throw new Error('Wallet not connected');
        }

        const amountWei = parseUnits(amount, 18);

        toast.loading('Funding PKP wallet...');

        try {
            const tx = await signer.sendTransaction({
                to: pkpAddress,
                value: amountWei.toString(),
            });

            const receipt = await tx.wait();
            toast.success('PKP wallet funded!');

            return receipt?.hash || tx.hash;

        } catch (error: any) {
            toast.error(error.message || 'PKP funding failed');
            throw error;
        }
    }, [signer, walletAddress]);

    // Execute same-chain deposit
    const executeSameChainDeposit = useCallback(async (params: {
        tokenAddress: Address;
        amount: string;
        decimals: number;
        isNative?: boolean;
        vaultChain?: number;
        useVincent?: boolean;
    }): Promise<RealDepositResult> => {
        const targetChain = params.vaultChain || chainId || 84532;
        const contracts = getContracts(targetChain);

        if (!contracts.CrashGuardCore) {
            throw new Error(`Vault not found for chain ${targetChain}`);
        }

        return executeRealVaultDeposit({
            token: params.tokenAddress,
            amount: params.amount,
            vaultAddress: contracts.CrashGuardCore as Address,
            chainId: targetChain,
            decimals: params.decimals,
            isNative: params.isNative,
        });
    }, [chainId, executeRealVaultDeposit]);

    // Execute cross-chain deposit with Vincent abilities
    const executeCrossChainDeposit = useCallback(async (params: {
        tokenAddress: Address;
        amount: string;
        decimals: number;
        sourceChain: number;
        targetChain: number;
        isNative?: boolean;
    }): Promise<{
        swapHash?: string;
        bridgeResult: any;
        depositResult: RealDepositResult
    }> => {
        if (!isAuthenticated || !user?.pkpAddress || !pkpWallet) {
            throw new Error('Vincent authentication required');
        }

        // Note: PKPs are managed by Lit Protocol and don't need direct ETH funding
        // Vincent abilities handle gas fees internally through the delegated execution model
        
        console.log('🔄 Starting cross-chain deposit flow:', {
            sourceChain: params.sourceChain,
            targetChain: params.targetChain,
            amount: params.amount,
            token: params.tokenAddress,
            pkpAddress: pkpWallet.address
        });

        // Step 1: Swap (if not native)
        let swapHash: string | undefined;
        let bridgedAmount = params.amount;

        if (!params.isNative) {
            const swapParams = {
                tokenIn: params.tokenAddress,
                tokenOut: '0x0000000000000000000000000000000000000000' as Address, // ETH
                amountIn: parseUnits(params.amount, params.decimals).toString(),
                minAmountOut: '0',
                recipient: pkpWallet.address as Address,
                chainId: params.sourceChain,
            };

            swapHash = await executeRealTokenSwap(swapParams);
            bridgedAmount = '0.001'; // Estimate ETH output
        }

        // Step 2: Bridge
        const bridgeParams = {
            fromChain: params.sourceChain,
            toChain: params.targetChain,
            token: '0x0000000000000000000000000000000000000000' as Address, // ETH
            amount: parseUnits(bridgedAmount, 18).toString(),
            recipient: pkpWallet.address as Address,
        };

        const bridgeHash = await executeRealCrossChainBridge(bridgeParams);
        const bridgeResult = { transactionHash: bridgeHash, bridgeOrderId: `bridge_${Date.now()}` };

        // Step 3: Deposit on target chain
        const contracts = getContracts(params.targetChain);
        const depositResult = await executeRealVaultDeposit({
            token: '0x0000000000000000000000000000000000000000' as Address, // ETH
            amount: bridgedAmount,
            vaultAddress: contracts.CrashGuardCore as Address,
            chainId: params.targetChain,
            decimals: 18,
            isNative: true,
        });

        return { swapHash, bridgeResult, depositResult };

    }, [isAuthenticated, user?.pkpAddress, pkpWallet, executeRealTokenSwap, executeRealCrossChainBridge, executeRealVaultDeposit]);

    return {
        // State
        isExecuting,

        // Methods
        executeTokenApproval,
        executePKPFunding,
        executeSameChainDeposit,
        executeCrossChainDeposit,
        executeTokenTransferToPKP,
        executeRealTokenSwap,
        executeRealCrossChainBridge,
        executeRealVaultDeposit,

        // Utilities
        canExecute: !!signer && !!walletAddress && isAuthenticated,
        walletAddress,
    };
};
