// Utility functions for converting between wagmi and ethers
import { BrowserProvider } from 'ethers';
import type { Chain, Client, Transport } from 'viem';
import type { GetWalletClientReturnType } from '@wagmi/core';

/**
 * Convert wagmi WalletClient to ethers Signer (synchronous wrapper)
 * This allows using ethers.js methods with wagmi wallet connections
 * Returns a signer-like object with async methods
 */
export function walletClientToSigner(walletClient: NonNullable<GetWalletClientReturnType>) {
    const { account, chain, transport } = walletClient;
    const network = {
        chainId: chain!.id,
        name: chain!.name,
        ensAddress: chain!.contracts?.ensRegistry?.address,
    };

    const provider = new BrowserProvider(transport, network);

    // Return an object with sendTransaction method that handles the async getSigner
    return {
        sendTransaction: async (transaction: any) => {
            const signer = await provider.getSigner(account!.address);
            return signer.sendTransaction(transaction);
        },
        getAddress: () => account!.address,
        provider,
    };
}

/**
 * Convert viem Client to ethers Provider
 */
export function clientToProvider(client: Client<Transport, Chain>) {
    const { chain, transport } = client;
    const network = {
        chainId: chain!.id,
        name: chain!.name,
        ensAddress: chain!.contracts?.ensRegistry?.address,
    };

    return new BrowserProvider(transport, network);
}
