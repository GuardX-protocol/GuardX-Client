import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { baseSepolia, arbitrumSepolia, mainnet } from 'wagmi/chains';

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Supported chains for the application
export const SUPPORTED_CHAINS = [baseSepolia, arbitrumSepolia, mainnet];

export const useWeb3Auth = () => {
  const { address, isConnected, connector, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider and signer when wallet is connected
  useEffect(() => {
    const initializeProvider = async () => {
      if (isConnected && window.ethereum) {
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const ethSigner = await browserProvider.getSigner();

          setProvider(browserProvider);
          setSigner(ethSigner);
          setError(null);
        } catch (err: any) {
          console.error('Failed to initialize provider:', err);
          setError(err.message || 'Failed to initialize wallet provider');
        }
      } else {
        setProvider(null);
        setSigner(null);
      }
    };

    initializeProvider();
  }, [isConnected, address, chain]);

  // Connect wallet using the first available connector (usually MetaMask or WalletConnect)
  const connectWallet = useCallback(async () => {
    setError(null);

    try {
      const connector = connectors.find(c => c.ready) || connectors[0];
      if (!connector) {
        throw new Error('No wallet connectors available');
      }

      await connect({ connector });
    } catch (err: any) {
      console.error('Wallet connection failed:', err);
      setError(err.message || 'Connection failed');
    }
  }, [connect, connectors]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    try {
      disconnect();
      setProvider(null);
      setSigner(null);
      setError(null);
    } catch (err: any) {
      console.error('Disconnect failed:', err);
      setError(err.message || 'Disconnect failed');
    }
  }, [disconnect]);

  // Switch to a specific chain
  const switchToChain = useCallback(async (targetChainId: number) => {
    if (!switchChain) {
      setError('Chain switching not supported');
      return;
    }

    try {
      setError(null);
      await switchChain({ chainId: targetChainId });
    } catch (err: any) {
      console.error('Chain switch failed:', err);
      setError(`Switch to chain ${targetChainId} failed: ${err.message}`);
    }
  }, [switchChain]);

  // Check if current chain is supported
  const isChainSupported = useCallback((chainId?: number) => {
    const targetChain = chainId || chain?.id;
    return SUPPORTED_CHAINS.some(supportedChain => supportedChain.id === targetChain);
  }, [chain?.id]);

  // Get chain name
  const getChainName = useCallback((chainId?: number) => {
    const targetChain = chainId || chain?.id;
    const supportedChain = SUPPORTED_CHAINS.find(c => c.id === targetChain);
    return supportedChain?.name || `Chain ${targetChain}`;
  }, [chain?.id]);

  return {
    // Connection state
    walletAddress: address,
    isConnected,
    isConnecting,
    connector,

    // Provider and signer
    provider,
    signer,

    // Chain info
    chain,
    chainId: chainId || chain?.id,
    chainName: getChainName(),
    isChainSupported: isChainSupported(), // Call the function to get boolean value
    isSwitching,

    // Actions
    connectWallet,
    disconnectWallet,
    switchChain: switchToChain,

    // Error state
    error: error || connectError?.message,

    // Utilities
    getChainName,
    isChainSupportedFn: isChainSupported, // Rename the function to avoid conflict
    supportedChains: SUPPORTED_CHAINS,
  };
};