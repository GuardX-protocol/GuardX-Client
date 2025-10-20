# GuardX Frontend

A modern DeFi crash protection platform built with React and Web3 technologies.

## Overview

GuardX is a decentralized finance application that provides advanced portfolio protection and risk management tools. The platform enables users to deposit assets, manage protection policies, monitor portfolio performance, and conduct security audits through an intuitive web interface.

## Features

- **Dashboard**: Real-time portfolio overview with key metrics and activity tracking
- **Asset Deposit**: Secure deposit interface for managing digital assets
- **Protection Policies**: Configure and manage crash protection strategies
- **Audit Tools**: Security audit capabilities for smart contracts and transactions
- **Web3 Integration**: Seamless wallet connectivity with MetaMask, WalletConnect, and other providers
- **Real-time Updates**: Live data synchronization using WebSocket connections

## Technology Stack

### Core Framework
- React 18.2
- TypeScript 5.2
- Vite 5.0

### Web3 & Blockchain
- Wagmi 1.4 - React hooks for Ethereum
- Viem 1.19 - TypeScript interface for Ethereum
- Support for Mainnet, Sepolia, and Hardhat networks

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

### Wallet Connect

To enable WalletConnect functionality, set the following environment variable:
```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Network Support

The application supports the following networks:
- Ethereum Mainnet
- Sepolia Testnet
- Hardhat Local Network

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
