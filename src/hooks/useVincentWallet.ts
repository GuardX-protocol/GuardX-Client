import { useMemo } from 'react';
import { useVincentAuth } from '@/components/auth/VincentAuth';
import { ethers } from 'ethers';
import { derivePkpEthAddress, debugPkpKey } from '@/utils/pkpUtils';

export const useVincentWallet = () => {
    const { user, isAuthenticated, jwt } = useVincentAuth();

    const wallet = useMemo(() => {
        if (!isAuthenticated || !user?.pkpAddress || !jwt) {
            return null;
        }

        try {
            // Debug and derive the PKP Ethereum address
            console.log('🔧 Setting up Vincent wallet for PKP:', user.pkpAddress);
            debugPkpKey(user.pkpAddress);

            const pkpEthAddress = derivePkpEthAddress(user.pkpAddress);
            console.log('📍 Derived PKP Ethereum address:', pkpEthAddress);

            // Use Chronicle Yellowstone for PKP operations
            const provider = new ethers.JsonRpcProvider('https://yellowstone-rpc.litprotocol.com');

            // Create a PKP-compatible signer
            // This uses the Vincent JWT to authenticate PKP operations
            const pkpSigner = {
                address: pkpEthAddress, // Use derived address
                provider,
                // Vincent abilities will use the JWT for authentication
                getAddress: () => Promise.resolve(pkpEthAddress),
                signMessage: async (message: string) => {
                    // This would be handled by Vincent abilities internally
                    throw new Error('Direct signing not supported - use Vincent abilities');
                },
                signTransaction: async (transaction: any) => {
                    // This would be handled by Vincent abilities internally
                    throw new Error('Direct transaction signing not supported - use Vincent abilities');
                },
                connect: (provider: any) => pkpSigner,
            };

            return {
                address: pkpEthAddress, // Use derived address
                provider,
                signer: pkpSigner,
                // Vincent App structure
                wallet: {
                    address: pkpEthAddress, // Use derived address
                    signer: pkpSigner,
                },
                pkpAddress: user.pkpAddress, // Original PKP key
                pkpEthAddress, // Derived Ethereum address
                jwt, // Include JWT for Vincent abilities
            };
        } catch (error) {
            console.error('Failed to setup Vincent wallet:', error);
            return null;
        }
    }, [isAuthenticated, user?.pkpAddress, jwt]);

    return {
        wallet,
        isReady: !!wallet,
        pkpAddress: user?.pkpAddress || null,
    };
};