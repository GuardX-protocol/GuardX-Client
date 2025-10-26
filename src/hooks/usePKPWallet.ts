import { useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { useVincentAuth } from '@/components/auth/VincentAuth';
import { useWalletTokenBalance } from './useWalletTokenBalance';
import { useVincentAbilities } from './useVincentAbilities';

export interface PKPWalletState {
  // PKP Info
  pkpAddress: string | null;
  isAuthenticated: boolean;
  
  // Balance Info
  balance: string; // ETH balance in wei
  formattedBalance: string; // Human readable ETH balance
  hasBalance: boolean;
  isBalanceLoading: boolean;
  
  // Funding State
  needsFunding: boolean;
  minimumBalance: string; // Minimum ETH needed for operations
  
  // Operations
  canExecuteOperations: boolean;
  
  // Methods
  refetchBalance: () => void;
  checkFundingStatus: () => boolean;
}

export const usePKPWallet = (chainId: number = 84532) => {
  const { user, isAuthenticated } = useVincentAuth();
  const { isExecuting } = useVincentAbilities();
  
  // Get PKP balance on the specified chain
  const { 
    balance: pkpBalance, 
    loading: balanceLoading, 
    refetch: refetchBalance 
  } = useWalletTokenBalance(chainId, undefined);

  // Minimum balance required for operations (0.001 ETH)
  const minimumBalance = '0.001';

  const pkpWalletState: PKPWalletState = useMemo(() => {
    const pkpAddress = user?.pkpAddress || null;
    const balance = pkpBalance?.nativeBalance || '0';
    const formattedBalance = pkpBalance?.formattedNative || '0.00';
    const hasBalance = parseFloat(formattedBalance) > 0;
    const needsFunding = parseFloat(formattedBalance) < parseFloat(minimumBalance);
    const canExecuteOperations = hasBalance && !needsFunding && !isExecuting;

    return {
      // PKP Info
      pkpAddress,
      isAuthenticated,
      
      // Balance Info
      balance,
      formattedBalance,
      hasBalance,
      isBalanceLoading: balanceLoading,
      
      // Funding State
      needsFunding,
      minimumBalance,
      
      // Operations
      canExecuteOperations,
      
      // Methods
      refetchBalance,
      checkFundingStatus: () => !needsFunding,
    };
  }, [
    user?.pkpAddress,
    isAuthenticated,
    pkpBalance,
    balanceLoading,
    minimumBalance,
    isExecuting,
    refetchBalance
  ]);

  return pkpWalletState;
};

// Hook for PKP operations with automatic funding checks
export const usePKPOperations = (chainId: number = 84532) => {
  const pkpWallet = usePKPWallet(chainId);
  const { 
    executeSwap, 
    crossChainBridge, 
    depositToVault, 
    crossChainSwapAndDeposit,
    withdrawFromVault,
    executeTokenTransfer,
    isExecuting 
  } = useVincentAbilities();

  const executeWithFundingCheck = useCallback(async (
    operation: () => Promise<any>,
    operationName: string
  ) => {
    if (!pkpWallet.isAuthenticated) {
      throw new Error('Vincent not authenticated');
    }

    if (!pkpWallet.pkpAddress) {
      throw new Error('PKP address not available');
    }

    if (pkpWallet.needsFunding) {
      throw new Error(`PKP needs funding. Current balance: ${pkpWallet.formattedBalance} ETH, minimum required: ${pkpWallet.minimumBalance} ETH`);
    }

    if (!pkpWallet.canExecuteOperations) {
      throw new Error('PKP cannot execute operations at this time');
    }

    // Executing operation with PKP wallet

    return await operation();
  }, [pkpWallet, chainId]);

  return {
    ...pkpWallet,
    
    // Enhanced operations with funding checks
    executeSwapWithCheck: useCallback(async (params: any) => {
      return executeWithFundingCheck(
        () => executeSwap(params),
        'Token Swap'
      );
    }, [executeWithFundingCheck, executeSwap]),

    executeBridgeWithCheck: useCallback(async (params: any) => {
      return executeWithFundingCheck(
        () => crossChainBridge(params),
        'Cross-chain Bridge'
      );
    }, [executeWithFundingCheck, crossChainBridge]),

    executeDepositWithCheck: useCallback(async (params: any) => {
      return executeWithFundingCheck(
        () => depositToVault(params),
        'Vault Deposit'
      );
    }, [executeWithFundingCheck, depositToVault]),

    executeSwapAndDepositWithCheck: useCallback(async (params: any) => {
      return executeWithFundingCheck(
        () => crossChainSwapAndDeposit(params),
        'Cross-chain Swap and Deposit'
      );
    }, [executeWithFundingCheck, crossChainSwapAndDeposit]),

    executeWithdrawWithCheck: useCallback(async (params: any) => {
      return executeWithFundingCheck(
        () => withdrawFromVault(params),
        'Vault Withdrawal'
      );
    }, [executeWithFundingCheck, withdrawFromVault]),

    executeTokenTransferWithCheck: useCallback(async (params: any) => {
      return executeWithFundingCheck(
        () => executeTokenTransfer(params),
        'Token Transfer'
      );
    }, [executeWithFundingCheck, executeTokenTransfer]),

    // Status checks
    isExecuting,
    getOperationStatus: () => ({
      canSwap: pkpWallet.canExecuteOperations,
      canBridge: pkpWallet.canExecuteOperations,
      canDeposit: pkpWallet.canExecuteOperations,
      needsFunding: pkpWallet.needsFunding,
      isReady: pkpWallet.canExecuteOperations && !isExecuting,
    }),
  };
};