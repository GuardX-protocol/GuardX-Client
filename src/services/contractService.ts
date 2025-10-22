import { readContract, writeContract, waitForTransaction } from '@wagmi/core';
import { parseUnits, formatUnits } from 'viem';
import { getContracts } from '@/config/contracts';
import {
  CrashGuardCoreABI,
  PythPriceMonitorABI,
  EmergencyExecutorABI,
  DEXAggregatorABI,
  PortfolioRebalancerABI
} from '@/config/abis';

class ContractService {
  // CrashGuardCore Methods
  async depositAsset(tokenAddress: string, amount: string, decimals: number, chainId: number) {
    const contracts = getContracts(chainId);
    const amountBigInt = parseUnits(amount, decimals);

    const { hash } = await writeContract({
      address: contracts.CrashGuardCore as `0x${string}`,
      abi: CrashGuardCoreABI,
      functionName: 'depositAsset',
      args: [tokenAddress as `0x${string}`, amountBigInt],
    });

    await waitForTransaction({ hash });
    return hash;
  }

  async withdrawAsset(tokenAddress: string, amount: string, decimals: number, chainId: number) {
    const contracts = getContracts(chainId);
    const amountBigInt = parseUnits(amount, decimals);

    const { hash } = await writeContract({
      address: contracts.CrashGuardCore as `0x${string}`,
      abi: CrashGuardCoreABI,
      functionName: 'withdrawAsset',
      args: [tokenAddress as `0x${string}`, amountBigInt],
    });

    await waitForTransaction({ hash });
    return hash;
  }

  async getPortfolio(userAddress: string, chainId: number) {
    const contracts = getContracts(chainId);

    const data = await readContract({
      address: contracts.CrashGuardCore as `0x${string}`,
      abi: CrashGuardCoreABI,
      functionName: 'getUserPortfolio',
      args: [userAddress as `0x${string}`],
    });

    return data;
  }

  async setProtectionPolicy(crashThreshold: number, recoveryThreshold: number, chainId: number) {
    const contracts = getContracts(chainId);

    const { hash } = await writeContract({
      address: contracts.CrashGuardCore as `0x${string}`,
      abi: CrashGuardCoreABI,
      functionName: 'setProtectionPolicy',
      args: [BigInt(crashThreshold), BigInt(recoveryThreshold)],
    });

    await waitForTransaction({ hash });
    return hash;
  }

  async getProtectionPolicy(userAddress: string, chainId: number) {
    const contracts = getContracts(chainId);

    const data = await readContract({
      address: contracts.CrashGuardCore as `0x${string}`,
      abi: CrashGuardCoreABI,
      functionName: 'getProtectionPolicy',
      args: [userAddress as `0x${string}`],
    });

    return data;
  }

  // PythPriceMonitor Methods
  async getPriceByToken(tokenAddress: string, chainId: number) {
    const contracts = getContracts(chainId);

    const data = await readContract({
      address: contracts.PythPriceMonitor as `0x${string}`,
      abi: PythPriceMonitorABI,
      functionName: 'getPriceByToken',
      args: [tokenAddress as `0x${string}`],
    });

    return data;
  }

  async getPriceHistory(tokenAddress: string, timeRange: number, chainId: number) {
    const contracts = getContracts(chainId);

    const data = await readContract({
      address: contracts.PythPriceMonitor as `0x${string}`,
      abi: PythPriceMonitorABI,
      functionName: 'getPriceHistory',
      args: [tokenAddress as `0x${string}`, BigInt(timeRange)],
    });

    return data;
  }

  // Emergency Executor Methods
  async executeEmergencyProtection(userAddress: string, chainId: number) {
    const contracts = getContracts(chainId);

    const { hash } = await writeContract({
      address: contracts.EmergencyExecutor as `0x${string}`,
      abi: EmergencyExecutorABI,
      functionName: 'executeEmergencyProtection',
      args: [userAddress as `0x${string}`],
    });

    await waitForTransaction({ hash });
    return hash;
  }

  // DEX Aggregator Methods
  async swapTokens(
    fromToken: string,
    toToken: string,
    amount: string,
    decimals: number,
    maxSlippage: number,
    chainId: number
  ) {
    const contracts = getContracts(chainId);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

    const { hash } = await writeContract({
      address: contracts.DEXAggregator as `0x${string}`,
      abi: DEXAggregatorABI,
      functionName: 'swapTokens',
      args: [
        fromToken as `0x${string}`,
        toToken as `0x${string}`,
        parseUnits(amount, decimals),
        BigInt(maxSlippage),
        deadline,
      ],
    });

    await waitForTransaction({ hash });
    return hash;
  }

  // Portfolio Rebalancer Methods
  async rebalancePortfolio(chainId: number) {
    const contracts = getContracts(chainId);

    const { hash } = await writeContract({
      address: contracts.PortfolioRebalancer as `0x${string}`,
      abi: PortfolioRebalancerABI,
      functionName: 'executeRebalance',
      args: [],
    });

    await waitForTransaction({ hash });
    return hash;
  }

  // Token Approval
  async approveToken(tokenAddress: string, spender: string, amount: string, decimals: number) {
    const { hash } = await writeContract({
      address: tokenAddress as `0x${string}`,
      abi: [
        {
          name: 'approve',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' }
          ],
          outputs: [{ name: '', type: 'bool' }]
        }
      ],
      functionName: 'approve',
      args: [spender as `0x${string}`, parseUnits(amount, decimals)],
    });

    await waitForTransaction({ hash });
    return hash;
  }
}

export const contractService = new ContractService();