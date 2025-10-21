/**
 * Multi-chain deployment configuration
 * Each chain has its own set of deployed contract addresses
 */

export interface DeploymentConfig {
    chainId: number;
    network: string;
    timestamp: string;
    contracts: {
        PythPriceMonitor: string;
        DEXAggregator: string;
        CrashGuardCore: string;
        EmergencyExecutor: string;
        LitRelayContract: string;
        LitProtocolIntegration: string;
        CrossChainManager: string;
        CrossChainEmergencyCoordinator: string;
        PortfolioRebalancer: string;
    };
    externalContracts: {
        PythContract: string;
        OneInchRouter: string;
        UniswapRouter: string;
        UniswapQuoter: string;
    };
}

/**
 * Deployment configurations for all supported chains
 */
export const DEPLOYMENTS: Record<number, DeploymentConfig> = {
    // Arbitrum Sepolia (Testnet)
    421614: {
        chainId: 421614,
        network: 'arbitrumSepolia',
        timestamp: '2025-10-21T10:11:45.458Z',
        contracts: {
            PythPriceMonitor: "0x78694a7A55f478e5Fee95Be6Aa5AC7A13c435C9B",
            DEXAggregator: "0x126Ab675060720d699A6470c5DCe3EBdD5E0029e",
            CrashGuardCore: "0xB867f226388e1695BE040EA45c7E13F8fB493E9a",
            EmergencyExecutor: "0x110704f8337A9CF4e236f0d3A67E5F39189539c7",
            LitRelayContract: "0x72BB4C4d925e12Fb8cc9776a32c5dbE8aB9DB500",
            LitProtocolIntegration: "0x6952402ed7a5a6cCB5033f7F84670aec1540C493",
            CrossChainManager: "0xEfa8B514714ebD129B3B011ce379C86225ce7244",
            CrossChainEmergencyCoordinator: "0xEfcB2f4aAf6c24E85e354a07ae7CAef15d81B40d",
            PortfolioRebalancer: "0xA1ED2F7C58a7A5e220084439eB1d966F2C629DE0"

        },
        externalContracts: {
            PythContract: '0x4374e5a8b9C22271E9EB878A2AA31DE97DF15DAF',
            OneInchRouter: '0x1111111254EEB25477B68fb85Ed929f73A960582',
            UniswapRouter: '0x101F443B4d1b059569D643917553c771E1b9663E',
            UniswapQuoter: '0x2779a0CC1c3e0E44D2542EC3e79e3864Ae93Ef0B',
        },
    },

    // Base Sepolia (Testnet)
    84532: {
        chainId: 84532,
        network: 'baseSepolia',
        timestamp: '2025-10-21T10:11:45.458Z',
        contracts: {
            PythPriceMonitor: "0x820F7145bc8765819A171972A064Af96665a708c",
            DEXAggregator: "0x39B0d6d3d98Fc4e6Ec69feF97BBFca9A39AAEa6C",
            CrashGuardCore: "0x714CD1EBAfcD09d67B2605cE46b597876d3A0026",
            EmergencyExecutor: "0x43D5729208F32579DA3CC33A97425a42Ca48ef52",
            LitRelayContract: "0x304723E2D8ff6e73594ad0d8D0950044606B9053",
            LitProtocolIntegration: "0x79625e589939513e1F2dF994BBaa263366D09786",
            CrossChainManager: "0x3EAc402b3fF08C96dD7A3CB64Cacd0001a6d0538",
            CrossChainEmergencyCoordinator: "0x1f09baFc6E37A44137c130974c035eDb448b42EB",
            PortfolioRebalancer: "0x6D9bCfdFbf62A71bB1773f8d302Cf7301418126b"
        },
        externalContracts: {
            PythContract: "0xA2aa501b19aff244D90cc15a4Cf739D2725B5729",
            OneInchRouter: "0x1111111254EEB25477B68fb85Ed929f73A960582",
            UniswapRouter: "0x2626664c2603336E57B271c5C0b26F421741e481",
            UniswapQuoter: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a"
        },
    },
    // Ethereum Mainnet
    1: {
        chainId: 1,
        network: 'mainnet',
        timestamp: '2025-10-21T10:11:45.458Z',
        contracts: {
            PythPriceMonitor: '0x0000000000000000000000000000000000000000', // TODO: Deploy
            DEXAggregator: '0x0000000000000000000000000000000000000000',
            CrashGuardCore: '0x0000000000000000000000000000000000000000',
            EmergencyExecutor: '0x0000000000000000000000000000000000000000',
            LitRelayContract: '0x0000000000000000000000000000000000000000',
            LitProtocolIntegration: '0x0000000000000000000000000000000000000000',
            CrossChainManager: '0x0000000000000000000000000000000000000000',
            CrossChainEmergencyCoordinator: '0x0000000000000000000000000000000000000000',
            PortfolioRebalancer: '0x0000000000000000000000000000000000000000',
        },
        externalContracts: {
            PythContract: '0x4305FB66699C3B2702D4d05CF36551390A4c69C6',
            OneInchRouter: '0x1111111254EEB25477B68fb85Ed929f73A960582',
            UniswapRouter: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
            UniswapQuoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
        },
    },

    // Polygon Mainnet
    137: {
        chainId: 137,
        network: 'polygon',
        timestamp: '2025-10-21T10:11:45.458Z',
        contracts: {
            PythPriceMonitor: '0x0000000000000000000000000000000000000000', // TODO: Deploy
            DEXAggregator: '0x0000000000000000000000000000000000000000',
            CrashGuardCore: '0x0000000000000000000000000000000000000000',
            EmergencyExecutor: '0x0000000000000000000000000000000000000000',
            LitRelayContract: '0x0000000000000000000000000000000000000000',
            LitProtocolIntegration: '0x0000000000000000000000000000000000000000',
            CrossChainManager: '0x0000000000000000000000000000000000000000',
            CrossChainEmergencyCoordinator: '0x0000000000000000000000000000000000000000',
            PortfolioRebalancer: '0x0000000000000000000000000000000000000000',
        },
        externalContracts: {
            PythContract: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',
            OneInchRouter: '0x1111111254EEB25477B68fb85Ed929f73A960582',
            UniswapRouter: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
            UniswapQuoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
        },
    },

    // Arbitrum Mainnet
    42161: {
        chainId: 42161,
        network: 'arbitrum',
        timestamp: '2025-10-21T10:11:45.458Z',
        contracts: {
            PythPriceMonitor: '0x0000000000000000000000000000000000000000', // TODO: Deploy
            DEXAggregator: '0x0000000000000000000000000000000000000000',
            CrashGuardCore: '0x0000000000000000000000000000000000000000',
            EmergencyExecutor: '0x0000000000000000000000000000000000000000',
            LitRelayContract: '0x0000000000000000000000000000000000000000',
            LitProtocolIntegration: '0x0000000000000000000000000000000000000000',
            CrossChainManager: '0x0000000000000000000000000000000000000000',
            CrossChainEmergencyCoordinator: '0x0000000000000000000000000000000000000000',
            PortfolioRebalancer: '0x0000000000000000000000000000000000000000',
        },
        externalContracts: {
            PythContract: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',
            OneInchRouter: '0x1111111254EEB25477B68fb85Ed929f73A960582',
            UniswapRouter: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
            UniswapQuoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
        },
    },

    // Optimism Mainnet
    10: {
        chainId: 10,
        network: 'optimism',
        timestamp: '2025-10-21T10:11:45.458Z',
        contracts: {
            PythPriceMonitor: '0x0000000000000000000000000000000000000000', // TODO: Deploy
            DEXAggregator: '0x0000000000000000000000000000000000000000',
            CrashGuardCore: '0x0000000000000000000000000000000000000000',
            EmergencyExecutor: '0x0000000000000000000000000000000000000000',
            LitRelayContract: '0x0000000000000000000000000000000000000000',
            LitProtocolIntegration: '0x0000000000000000000000000000000000000000',
            CrossChainManager: '0x0000000000000000000000000000000000000000',
            CrossChainEmergencyCoordinator: '0x0000000000000000000000000000000000000000',
            PortfolioRebalancer: '0x0000000000000000000000000000000000000000',
        },
        externalContracts: {
            PythContract: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',
            OneInchRouter: '0x1111111254EEB25477B68fb85Ed929f73A960582',
            UniswapRouter: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
            UniswapQuoter: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
        },
    },

    // Base Mainnet
    8453: {
        chainId: 8453,
        network: 'base',
        timestamp: '2025-10-21T10:11:45.458Z',
        contracts: {
            PythPriceMonitor: '0x0000000000000000000000000000000000000000', // TODO: Deploy
            DEXAggregator: '0x0000000000000000000000000000000000000000',
            CrashGuardCore: '0x0000000000000000000000000000000000000000',
            EmergencyExecutor: '0x0000000000000000000000000000000000000000',
            LitRelayContract: '0x0000000000000000000000000000000000000000',
            LitProtocolIntegration: '0x0000000000000000000000000000000000000000',
            CrossChainManager: '0x0000000000000000000000000000000000000000',
            CrossChainEmergencyCoordinator: '0x0000000000000000000000000000000000000000',
            PortfolioRebalancer: '0x0000000000000000000000000000000000000000',
        },
        externalContracts: {
            PythContract: '0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a',
            OneInchRouter: '0x1111111254EEB25477B68fb85Ed929f73A960582',
            UniswapRouter: '0x2626664c2603336E57B271c5C0b26F421741e481',
            UniswapQuoter: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a',
        },
    },
};

/**
 * Get deployment config for a specific chain
 */
export const getDeployment = (chainId: number): DeploymentConfig | undefined => {
    return DEPLOYMENTS[chainId];
};

/**
 * Check if contracts are deployed on a chain
 */
export const isChainDeployed = (chainId: number): boolean => {
    const deployment = DEPLOYMENTS[chainId];
    if (!deployment) return false;

    // Check if any contract is deployed (not zero address)
    return Object.values(deployment.contracts).some(
        address => address !== '0x0000000000000000000000000000000000000000'
    );
};

/**
 * Get all deployed chains
 */
export const getDeployedChains = (): number[] => {
    return Object.keys(DEPLOYMENTS)
        .map(Number)
        .filter(isChainDeployed);
};
