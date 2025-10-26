import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useVincentAuth } from '@/components/auth/VincentAuth';

/**
 * Unified authentication state that combines traditional wallet and Vincent authentication
 */
export interface UnifiedAuthState {
  // Connection status
  isConnected: boolean;
  
  // Address (from wallet or Vincent PKP)
  address: string | undefined;
  
  // Authentication method
  authMethod: 'none' | 'wallet' | 'vincent' | 'both';
  
  // Capabilities
  canDoSameChain: boolean;
  canDoCrossChain: boolean;
}

/**
 * Hook that provides unified authentication state across wallet and Vincent
 */
export function useUnifiedAuth(): UnifiedAuthState {
  const { address: walletAddress, isConnected: isWalletConnected } = useAccount();
  const { isAuthenticated: isVincentAuthenticated, user: vincentUser } = useVincentAuth();

  return useMemo(() => {
    const hasWallet = isWalletConnected && !!walletAddress;
    const hasVincent = isVincentAuthenticated && !!vincentUser?.pkpAddress;

    // Determine auth method
    let authMethod: UnifiedAuthState['authMethod'] = 'none';
    if (hasWallet && hasVincent) {
      authMethod = 'both';
    } else if (hasWallet) {
      authMethod = 'wallet';
    } else if (hasVincent) {
      authMethod = 'vincent';
    }

    // Determine effective address (prefer wallet, fallback to Vincent)
    const effectiveAddress = walletAddress || vincentUser?.pkpAddress;

    // Determine capabilities
    const canDoSameChain = hasWallet || hasVincent;
    const canDoCrossChain = hasVincent; // Only Vincent can do cross-chain for now

    return {
      isConnected: hasWallet || hasVincent,
      address: effectiveAddress,
      authMethod,
      canDoSameChain,
      canDoCrossChain,
    };
  }, [isWalletConnected, walletAddress, isVincentAuthenticated, vincentUser]);
}

/**
 * Transaction signer recommendation based on operation type
 */
export function useTransactionSigner() {
  const unifiedAuth = useUnifiedAuth();

  const getRecommendedSigner = (needsCrossChain: boolean): 'wallet' | 'vincent' | null => {
    // If cross-chain is needed, only Vincent can handle it
    if (needsCrossChain) {
      return unifiedAuth.canDoCrossChain ? 'vincent' : null;
    }

    // For same-chain operations, prefer wallet if available
    if (unifiedAuth.authMethod === 'both') {
      return 'wallet'; // Prefer wallet when both are available
    }

    if (unifiedAuth.authMethod === 'wallet') {
      return 'wallet';
    }

    if (unifiedAuth.authMethod === 'vincent') {
      return 'vincent';
    }

    return null;
  };

  return {
    getRecommendedSigner,
    unifiedAuth,
  };
}
