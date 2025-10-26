import { createConfig, http } from 'wagmi';
import { metaMask, walletConnect, injected } from 'wagmi/connectors';
import { SUPPORTED_CHAINS, DEFAULT_CHAIN } from './chains';

const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '4243717e79313e7a8086903a599003a6';

// Create transports for all supported chains
const transports = SUPPORTED_CHAINS.reduce((acc, chain) => {
  acc[chain.id] = http();
  return acc;
}, {} as Record<number, ReturnType<typeof http>>);

export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'GuardX',
        url: 'https://guardx.finance',
      },
    }),
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      metadata: {
        name: 'GuardX',
        description: 'Multi-Chain DeFi Crash Protection Platform',
        url: 'https://guardx.finance',
        icons: ['https://guardx.finance/logo.png'],
      },
      showQrModal: true,
    }),
    injected({
      target: 'metaMask',
    }),
  ],
  transports,
});

export { SUPPORTED_CHAINS as chains, DEFAULT_CHAIN };