// Multi-Token Vault contract constants for Base Sepolia
export const VAULT_CONTRACTS = {
  CHAIN_ID: 84532, // Base Sepolia
  // New MultiTokenVault that accepts ETH and other risky tokens
  MULTI_TOKEN_VAULT_ADDRESS:
    "0xC3f1830551F3FB86ccb072eBd9cCcA4e31503202" as const,
  // Legacy single-asset vault (for reference)
  LEGACY_VAULT_ADDRESS: "0xa1c9cB3355222b5E95686b95DC81320ccC06BBe5" as const,
};

// Base Sepolia risky token addresses (assets that can crash and need protection)
export const BASE_SEPOLIA_TOKENS = {
  ETH: {
    address: "0x0000000000000000000000000000000000000000" as const, // Native ETH
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    isRisky: true, // Volatile asset that can crash
  },
  WETH: {
    address: "0x4200000000000000000000000000000000000006" as const,
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    logoURI: "https://assets.coingecko.com/coins/images/2518/small/weth.png",
    isRisky: true, // Volatile asset that can crash
  },
  // Adding testnet tokens for cross-chain deposits (from Arbitrum Sepolia)
  USDC: {
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const, // Base Sepolia USDC
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
    isRisky: false, // Stablecoin - less risky but can still be protected
  },
  USDT: {
    address: "0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2" as const, // Base Sepolia USDT (example)
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
    logoURI: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    isRisky: false, // Stablecoin - less risky but can still be protected
  },
  // Note: Removed MOCK token as it's only for testing
} as const;

// Supported tokens for crash protection (including both risky and stable assets)
export const SUPPORTED_TOKENS = [
  BASE_SEPOLIA_TOKENS.ETH, // Native ETH - primary risky asset
  BASE_SEPOLIA_TOKENS.WETH, // Wrapped ETH - secondary risky asset
  BASE_SEPOLIA_TOKENS.USDC, // USDC - stable asset that can still benefit from protection
  BASE_SEPOLIA_TOKENS.USDT, // USDT - stable asset that can still benefit from protection
] as const;

export type SupportedToken = (typeof SUPPORTED_TOKENS)[number];
