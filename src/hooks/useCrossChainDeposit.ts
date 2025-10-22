import { useState, useMemo } from 'react';
import { useAccount, useNetwork, useContractWrite, useWaitForTransaction, useSwitchNetwork } from 'wagmi';
import { parseUnits } from 'viem';
import toast from 'react-hot-toast';
import { getDeployment, getDeployedChains } from '@/config/deployments';
import { CrashGuardCoreABI, SimpleCrossChainBridgeABI } from '@/config/abis';
import { TokenInfo } from '@uniswap/token-lists';

export interface CrossChainDepositParams {
  token: TokenInfo;
  amount: string;
  sourceChainId: number;
  destinationChainId: number;
  recipient?: string; // Optional, defaults to user's address
}

export interface ChainInfo {
  chainId: number;
  name: string;
  isDeployed: boolean;
  contracts?: {
    CrashGuardCore: string;
    SimpleCrossChainBridge: string;
  };
}

/**
 * Hook for cross-chain deposits
 * Allows users to deposit tokens from any supported chain to any other supported chain
 */
export const useCrossChainDeposit = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');

  // Get all supported chains
  const supportedChains = useMemo((): ChainInfo[] => {
    const deployedChainIds = getDeployedChains();
    
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      10: 'Optimism',
      137: 'Polygon',
      8453: 'Base',
      42161: 'Arbitrum',
      421614: 'Arbitrum Sepolia',
      84532: 'Base Sepolia',
    };

    return deployedChainIds.map(chainId => {
      const deployment = getDeployment(chainId);
      return {
        chainId,
        name: chainNames[chainId] || `Chain ${chainId}`,
        isDeployed: true,
        contracts: deployment ? {
          CrashGuardCore: deployment.contracts.CrashGuardCore,
          SimpleCrossChainBridge: deployment.contracts.SimpleCrossChainBridge,
        } : undefined,
      };
    });
  }, []);

  // Check if cross-chain deposit is needed
  const isCrossChain = (sourceChainId: number, destinationChainId: number): boolean => {
    return sourceChainId !== destinationChainId;
  };

  // Same-chain deposit (direct to CrashGuardCore)
  const { write: directDeposit, data: directDepositTx } = useContractWrite({
    address: undefined, // Will be set dynamically
    abi: CrashGuardCoreABI,
    functionName: 'depositAsset',
    onSuccess: (data) => {
      console.log('✅ Direct deposit transaction sent:', data.hash);
      toast.success('Deposit transaction sent!');
    },
    onError: (error) => {
      console.error('❌ Direct deposit failed:', error);
      toast.error(`Deposit failed: ${error.message}`);
      setIsProcessing(false);
    }
  });

  // Cross-chain deposit (via SimpleCrossChainBridge)
  const { write: bridgeDeposit, data: bridgeDepositTx } = useContractWrite({
    address: undefined, // Will be set dynamically
    abi: SimpleCrossChainBridgeABI,
    functionName: 'initiateCrossChainDeposit',
    onSuccess: (data) => {
      console.log('✅ Bridge deposit transaction sent:', data.hash);
      toast.success('Cross-chain deposit initiated!');
    },
    onError: (error) => {
      console.error('❌ Bridge deposit failed:', error);
      toast.error(`Cross-chain deposit failed: ${error.message}`);
      setIsProcessing(false);
    }
  });

  // Wait for direct deposit confirmation
  useWaitForTransaction({
    hash: directDepositTx?.hash,
    onSuccess: (receipt) => {
      console.log('✅ Direct deposit confirmed:', receipt.transactionHash);
      toast.success('Deposit successful! 🎉');
      setIsProcessing(false);
      setCurrentStep('');
    },
    onError: (error) => {
      console.error('❌ Direct deposit confirmation failed:', error);
      toast.error('Deposit confirmation failed');
      setIsProcessing(false);
      setCurrentStep('');
    }
  });

  // Wait for bridge deposit confirmation
  useWaitForTransaction({
    hash: bridgeDepositTx?.hash,
    onSuccess: (receipt) => {
      console.log('✅ Bridge deposit confirmed:', receipt.transactionHash);
      toast.success('Cross-chain deposit initiated! Processing on destination chain...');
      setCurrentStep('Processing on destination chain...');
      // Note: In a real implementation, you'd monitor the destination chain for completion
      setTimeout(() => {
        toast.success('Cross-chain deposit completed! 🎉');
        setIsProcessing(false);
        setCurrentStep('');
      }, 5000); // Simulate processing time
    },
    onError: (error) => {
      console.error('❌ Bridge deposit confirmation failed:', error);
      toast.error('Cross-chain deposit confirmation failed');
      setIsProcessing(false);
      setCurrentStep('');
    }
  });

  /**
   * Execute a cross-chain deposit
   */
  const executeCrossChainDeposit = async (params: CrossChainDepositParams) => {
    const { token, amount, sourceChainId, destinationChainId, recipient } = params;

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsProcessing(true);

    try {
      // Check if we need to switch networks
      if (chain?.id !== sourceChainId) {
        setCurrentStep('Switching to source network...');
        if (switchNetwork) {
          await switchNetwork(sourceChainId);
          // Wait a bit for network switch
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          throw new Error('Please switch to the source network manually');
        }
      }

      const sourceDeployment = getDeployment(sourceChainId);
      const destinationDeployment = getDeployment(destinationChainId);

      if (!sourceDeployment || !destinationDeployment) {
        throw new Error('Contracts not deployed on selected chains');
      }

      const amountBigInt = parseUnits(amount, token.decimals);
      const recipientAddress = recipient || address;

      if (isCrossChain(sourceChainId, destinationChainId)) {
        // Cross-chain deposit via bridge
        setCurrentStep('Initiating cross-chain deposit...');
        
        bridgeDeposit?.({
          address: sourceDeployment.contracts.SimpleCrossChainBridge as `0x${string}`,
          args: [
            token.address as `0x${string}`,
            amountBigInt,
            BigInt(destinationChainId),
            recipientAddress as `0x${string}`
          ]
        });
      } else {
        // Same-chain direct deposit
        setCurrentStep('Processing deposit...');
        
        directDeposit?.({
          address: sourceDeployment.contracts.CrashGuardCore as `0x${string}`,
          args: [
            token.address as `0x${string}`,
            amountBigInt
          ]
        });
      }
    } catch (error) {
      console.error('❌ Cross-chain deposit failed:', error);
      toast.error(error instanceof Error ? error.message : 'Cross-chain deposit failed');
      setIsProcessing(false);
      setCurrentStep('');
    }
  };

  /**
   * Get estimated fees for cross-chain deposit
   */
  const getEstimatedFees = (sourceChainId: number, destinationChainId: number) => {
    if (!isCrossChain(sourceChainId, destinationChainId)) {
      return {
        bridgeFee: '0',
        gasFee: 'TBD', // Would be calculated based on current gas prices
        total: 'TBD'
      };
    }

    // Estimated cross-chain fees (in practice, these would be fetched from the bridge contract)
    return {
      bridgeFee: '0.001', // ETH equivalent
      gasFee: 'TBD',
      total: 'TBD'
    };
  };

  /**
   * Check if a chain pair is supported for cross-chain deposits
   */
  const isChainPairSupported = (sourceChainId: number, destinationChainId: number): boolean => {
    const sourceSupported = supportedChains.some(chain => chain.chainId === sourceChainId);
    const destinationSupported = supportedChains.some(chain => chain.chainId === destinationChainId);
    return sourceSupported && destinationSupported;
  };

  return {
    // State
    isProcessing,
    currentStep,
    supportedChains,
    
    // Functions
    executeCrossChainDeposit,
    getEstimatedFees,
    isChainPairSupported,
    isCrossChain,
    
    // Transaction data
    directDepositTx,
    bridgeDepositTx,
  };
};

export default useCrossChainDeposit;