import type { Chain } from 'viem/chains';
import {
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base,
  sepolia,
  polygonMumbai,
  arbitrumSepolia,
  optimismSepolia,
  baseSepolia,
} from 'wagmi/chains';

export const PRODUCTION_CHAINS: Chain[] = [
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base,
];

export const TESTNET_CHAINS: Chain[] = [
  sepolia,
  polygonMumbai,
  arbitrumSepolia,
  optimismSepolia,
  baseSepolia,
];

/**
 * All supported chains based on environment
 */
export const SUPPORTED_CHAINS: Chain[] =
  import.meta.env.MODE === 'production'
    ? PRODUCTION_CHAINS
    : [...TESTNET_CHAINS, ...PRODUCTION_CHAINS];

/**
 * Default chain based on environment
 */
export const DEFAULT_CHAIN: Chain =
  import.meta.env.MODE === 'production'
    ? base
    : baseSepolia; // Changed to Base Sepolia for testnet

/**
 * Chain metadata for UI display
 */
export const CHAIN_METADATA: Record<number, {
  name: string;
  shortName: string;
  color: string;
  icon: string;
  explorer: string;
  isTestnet: boolean;
}> = {
  // Mainnets
  1: {
    name: 'Ethereum',
    shortName: 'ETH',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: '⟠',
    explorer: 'https://etherscan.io',
    isTestnet: false,
  },
  137: {
    name: 'Polygon',
    shortName: 'MATIC',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: '⬡',
    explorer: 'https://polygonscan.com',
    isTestnet: false,
  },
  42161: {
    name: 'Arbitrum',
    shortName: 'ARB',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: '◆',
    explorer: 'https://arbiscan.io',
    isTestnet: false,
  },
  10: {
    name: 'Optimism',
    shortName: 'OP',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: '🔴',
    explorer: 'https://optimistic.etherscan.io',
    isTestnet: false,
  },
  8453: {
    name: 'Base',
    shortName: 'BASE',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: '🟡',
    explorer: 'https://basescan.org',
    isTestnet: false,
  },
  // Testnets
  11155111: {
    name: 'Sepolia',
    shortName: 'SEP',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: '⟠',
    explorer: 'https://sepolia.etherscan.io',
    isTestnet: true,
  },
  80001: {
    name: 'Mumbai',
    shortName: 'MUMBAI',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: '⬡',
    explorer: 'https://mumbai.polygonscan.com',
    isTestnet: true,
  },
  421614: {
    name: 'Arbitrum Sepolia',
    shortName: 'ARB-SEP',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: '◆',
    explorer: 'https://sepolia.arbiscan.io',
    isTestnet: true,
  },
  11155420: {
    name: 'Optimism Sepolia',
    shortName: 'OP-SEP',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: '🔴',
    explorer: 'https://sepolia-optimism.etherscan.io',
    isTestnet: true,
  },
  84532: {
    name: 'Base Sepolia',
    shortName: 'BASE-SEP',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: '🟡',
    explorer: 'https://sepolia.basescan.org',
    isTestnet: true,
  },
};

/**
 * Get chain metadata by chain ID
 */
export const getChainMetadata = (chainId: number) => {
  return CHAIN_METADATA[chainId] || {
    name: 'Unknown',
    shortName: 'UNKNOWN',
    color: 'bg-gray-50 text-gray-700 border-gray-200',
    icon: '?',
    explorer: '',
    isTestnet: false,
  };
};

/**
 * Check if chain is supported
 */
export const isSupportedChain = (chainId: number): boolean => {
  return SUPPORTED_CHAINS.some(chain => chain.id === chainId);
};

/**
 * Get chain by ID
 */
export const getChainById = (chainId: number): Chain | undefined => {
  return SUPPORTED_CHAINS.find(chain => chain.id === chainId);
};