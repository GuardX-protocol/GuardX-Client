import { useMemo } from 'react';
import { useVincentAuth } from '@/components/auth/VincentAuth';
import { useWeb3Auth } from './useWeb3Auth';

export type AuthMethod = 'wallet' | 'vincent' | 'both' | 'none';

export interface UnifiedAuthState {
    // Connection status
    isConnected: boolean;
    authMethod: AuthMethod;

    // Addresses
    address: string | null;
    walletAddress: string | null;
    vincentAddress: string | null;

    // Capabilities
    canDoSameChain: boolean;
    canDoCrossChain: boolean;
    canDoVaultOperations: boolean;

    // Provider info
    chainId: number | null;
    chainName: string | null;
    isChainSupported: boolean;

    // Loading states
    isConnecting: boolean;

    // Error states
    error: string | null;
}

/**
 * Unified authentication hook that combines Vincent and Web3 wallet states
 * Provides a single interface for checking authentication status and capabilities
 */
export const useUnifiedAuth = (): UnifiedAuthState => {
    const {
        isAuthenticated: isVincentAuthenticated,
        user: vincentUser,
        isLoading: isVincentLoading
    } = useVincentAuth();

    const {
        walletAddress,
        isConnected: isWalletConnected,
        isConnecting: isWalletConnecting,
        chainId,
        chainName,
        isChainSupported,
        error: walletError
    } = useWeb3Auth();

    return useMemo(() => {
        // Determine auth method
        let authMethod: AuthMethod = 'none';
        if (isWalletConnected && isVincentAuthenticated) {
            authMethod = 'both';
        } else if (isWalletConnected) {
            authMethod = 'wallet';
        } else if (isVincentAuthenticated) {
            authMethod = 'vincent';
        }

        // Determine primary address
        const address = walletAddress || vincentUser?.pkpAddress || null;

        // Determine capabilities
        const canDoSameChain = Boolean(isWalletConnected && isChainSupported);
        const canDoCrossChain = Boolean(isVincentAuthenticated);
        const canDoVaultOperations = Boolean(isWalletConnected || isVincentAuthenticated);

        // Overall connection status
        const isConnected = isWalletConnected || isVincentAuthenticated;

        // Loading state
        const isConnecting = isWalletConnecting || isVincentLoading;

        return {
            // Connection status
            isConnected,
            authMethod,

            // Addresses
            address,
            walletAddress: walletAddress || null,
            vincentAddress: vincentUser?.pkpAddress || null,

            // Capabilities
            canDoSameChain: canDoSameChain,
            canDoCrossChain,
            canDoVaultOperations,

            // Provider info
            chainId: chainId || null,
            chainName: chainName || null,
            isChainSupported,

            // Loading states
            isConnecting,

            // Error states
            error: walletError || null,
        };
    }, [
        isVincentAuthenticated,
        vincentUser,
        isVincentLoading,
        walletAddress,
        isWalletConnected,
        isWalletConnecting,
        chainId,
        chainName,
        isChainSupported,
        walletError,
    ]);
};

/**
 * Hook to get the appropriate signer for transactions
 * Returns Vincent abilities for cross-chain or Web3 signer for same-chain
 */
export const useTransactionSigner = () => {
    const { signer } = useWeb3Auth();
    const { isAuthenticated: isVincentAuthenticated } = useVincentAuth();
    const unifiedAuth = useUnifiedAuth();

    return useMemo(() => {
        return {
            // Web3 signer for same-chain operations
            web3Signer: signer,

            // Vincent for cross-chain operations
            hasVincentAuth: isVincentAuthenticated,

            // Recommended signer based on operation type
            getRecommendedSigner: (isCrossChain: boolean) => {
                if (isCrossChain && isVincentAuthenticated) {
                    return 'vincent';
                } else if (!isCrossChain && signer) {
                    return 'web3';
                }
                return null;
            },

            // Auth state
            ...unifiedAuth,
        };
    }, [signer, isVincentAuthenticated, unifiedAuth]);
};