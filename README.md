# GuardX Frontend

A production-ready, multi-chain DeFi crash protection platform built with React and Web3 technologies.

## Overview

GuardX is a decentralized finance application that provides advanced portfolio protection and risk management tools across multiple blockchain networks. The platform enables users to deposit assets, manage protection policies, monitor portfolio performance, and conduct security audits through an intuitive web interface.

## 🌐 Multi-Chain Support

GuardX supports multiple EVM-compatible networks:

### Testnets
- ✅ **Arbitrum Sepolia** (Chain ID: 421614) - Fully deployed
- 🔄 **Base Sepolia** (Chain ID: 84532) - Ready to deploy
- 🔄 **Sepolia** (Chain ID: 11155111) - Ready to deploy
- 🔄 **Mumbai** (Chain ID: 80001) - Ready to deploy
- 🔄 **Optimism Sepolia** (Chain ID: 11155420) - Ready to deploy

### Mainnets (Production Ready)
- 🔄 **Ethereum** (Chain ID: 1)
- 🔄 **Polygon** (Chain ID: 137)
- 🔄 **Arbitrum** (Chain ID: 42161)
- 🔄 **Optimism** (Chain ID: 10)
- 🔄 **Base** (Chain ID: 8453)

## ✨ Features

- **Multi-Chain Dashboard**: Real-time portfolio overview across all supported networks
- **Asset Deposit**: Secure deposit interface for managing digital assets on any chain
- **Protection Policies**: Configure and manage crash protection strategies
- **Network Switching**: Seamless switching between supported networks
- **Audit Tools**: Security audit capabilities for smart contracts and transactions
- **Web3 Integration**: Seamless wallet connectivity with MetaMask, WalletConnect, and other providers
- **Real-time Price Feeds**: Live price data via Pyth Network (300+ assets)
- **Dynamic Price Discovery**: Automatic price feed detection and management
- **Cross-Chain Support**: Manage assets across multiple chains from a single interface

## Technology Stack

### Core Framework
- React 18.2
- TypeScript 5.2
- Vite 5.0

### Web3 & Blockchain
- Wagmi 1.4 - React hooks for Ethereum
- Viem 1.19 - TypeScript interface for Ethereum
- Multi-chain support for 10+ EVM networks
- Pyth Network integration for real-time price feeds (Hermes API)
- @pythnetwork/hermes-client for dynamic price feed management
- 1inch & Uniswap V3 DEX integration

### State Management & Data Fetching
- Zustand 4.4 - Lightweight state management
- TanStack Query 5.8 - Server state management
- React Hook Form 7.48 - Form handling

### UI & Styling
- Tailwind CSS 3.3
- Framer Motion 10.16 - Animations
- Lucide React - Icon library
- Recharts 2.8 - Data visualization

### Additional Libraries
- Axios 1.6 - HTTP client
- Socket.io Client 4.7 - Real-time communication
- React Router DOM 6.20 - Routing
- React Hot Toast 2.4 - Notifications
- date-fns 2.30 - Date utilities

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- pnpm package manager

### Installation

1. Clone the repository
2. Install dependencies:
```bash
pnpm install
```

3. Create environment configuration:
```bash
cp env.example .env
```

4. Configure environment variables in `.env` file

### Development

Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Build

Create a production build:
```bash
pnpm build
```

Preview the production build:
```bash
pnpm preview
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm test` - Run tests once
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Generate test coverage report
- `pnpm lint` - Lint code
- `pnpm lint:fix` - Fix linting issues
- `pnpm type-check` - Check TypeScript types

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── layout/    # Layout components
│   └── ui/        # UI primitives
├── config/        # Configuration files
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── services/      # API and external services
├── stores/        # State management
├── styles/        # Global styles
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Configuration

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Configure WalletConnect (optional but recommended):
```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

Get your project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/)

### Network Configuration

The application is configured for **Base Sepolia Testnet**:
- Chain ID: 84532
- Network: base-sepolia
- Contract addresses are automatically loaded from `deployment-base-sepolia-1761029713650.json`

Additional supported networks:
- Ethereum Mainnet
- Sepolia Testnet
- Hardhat Local Network

### Smart Contract Integration

All deployed contract addresses and ABIs are configured in:
- `src/config/contracts.ts` - Contract addresses
- `src/config/abis/` - Contract ABIs

See `INTEGRATION.md` for detailed contract integration documentation.

## Testing

The project uses Vitest for testing with jsdom environment for DOM testing.

Run tests:
```bash
pnpm test
```

Generate coverage report:
```bash
pnpm test:coverage
```

## Code Quality

### Linting

ESLint is configured with TypeScript support and React-specific rules.

### Type Checking

TypeScript strict mode is enabled for enhanced type safety.

## License

Copyright 2024 GuardX. All rights reserved.

## Support

For issues and questions, please refer to the project documentation or contact the development team.

## 🔮 Pyth Network Integration

GuardX integrates with Pyth Network for real-time, decentralized price feeds across 300+ crypto assets.

### Features

- **Dynamic Price Discovery**: Automatically fetches available price feeds from Pyth Network
- **Real-time Updates**: Sub-second price updates with confidence intervals
- **Decentralized Oracle**: No single point of failure, cryptographically secure
- **Comprehensive Coverage**: Supports major cryptocurrencies, DeFi tokens, stablecoins, and more

### Implementation

The Pyth integration uses the official Hermes client for optimal performance:

```typescript
import { usePythPrices, usePythPrice } from '@/hooks/usePythPrices';

// Get multiple token prices
const { priceMap, isLoading } = usePythPrices(['BTC', 'ETH', 'USDC']);

// Get single token price
const { price, error } = usePythPrice('BTC');
```

### Supported Assets

The integration dynamically discovers supported assets, including:

- **Major Cryptocurrencies**: BTC, ETH, BNB, SOL, ADA, DOT, AVAX
- **Stablecoins**: USDC, USDT, DAI, BUSD, FRAX, EUROC
- **DeFi Tokens**: LINK, UNI, AAVE, CRV, SUSHI, COMP, MKR
- **Layer 2 Tokens**: MATIC, ARB, OP, IMX, STX
- **Meme Tokens**: DOGE, SHIB, PEPE, BONK, FLOKI

### Price Feed Categories

Tokens are automatically categorized for easy filtering:

```typescript
import { usePythTokensByCategory } from '@/hooks/usePythPrices';

const { tokens: stablecoins } = usePythTokensByCategory('stablecoins');
const { tokens: defiTokens } = usePythTokensByCategory('defi');
```

### Configuration

No manual configuration required - the service automatically:
- Discovers available price feeds
- Maps token symbols to Pyth feed IDs  
- Handles price formatting and confidence intervals
- Provides fallback mechanisms for unsupported tokens

### Performance

- **Caching**: Intelligent caching reduces API calls
- **Batch Requests**: Multiple prices fetched in single API call
- **Error Handling**: Graceful fallbacks for network issues
- **Type Safety**: Full TypeScript support with proper types

See the Pyth Network [documentation](https://docs.pyth.network/) for more details on the underlying oracle infrastructure.