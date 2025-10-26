import React, { useState, useEffect } from 'react';
import { ArrowRight, Wallet, Shield, CheckCircle, AlertTriangle, Loader2, Send } from 'lucide-react';
import { parseUnits } from 'viem';
import toast from 'react-hot-toast';
import { useWeb3Auth } from '@/hooks/useWeb3Auth';
import { useVincentAuth } from '@/components/auth/VincentAuth';
import { useWalletTokenBalance } from '@/hooks/useWalletTokenBalance';

interface PKPFundingFlowProps {
  onFundingComplete: () => void;
}

const PKPFundingFlow: React.FC<PKPFundingFlowProps> = ({ onFundingComplete }) => {
  const [fundingAmount, setFundingAmount] = useState('0.01');
  const [isFunding, setIsFunding] = useState(false);
  const [fundingStep, setFundingStep] = useState<'ready' | 'funding' | 'confirming' | 'complete'>('ready');

  const { 
    signer, 
    walletAddress, 
    isConnected: isWalletConnected,
    chainId,
    switchChain
  } = useWeb3Auth();

  const { 
    user: vincentUser, 
    isAuthenticated: isVincentAuthenticated 
  } = useVincentAuth();

  // Get EOA balance on current chain
  const { 
    balance: eoaBalance, 
    loading: eoaBalanceLoading, 
    refetch: refetchEOABalance 
  } = useWalletTokenBalance(chainId || 84532, undefined); // Native ETH

  // Get PKP balance on Base Sepolia (where vault is)
  const { 
    balance: pkpBalance, 
    loading: pkpBalanceLoading, 
    refetch: refetchPKPBalance 
  } = useWalletTokenBalance(84532, undefined); // Base Sepolia ETH

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0.00';
    if (num < 0.0001) return '< 0.0001';
    return num.toFixed(4);
  };

  const hasEnoughBalance = () => {
    if (!eoaBalance) return false;
    const available = parseFloat(eoaBalance.formattedNative);
    const needed = parseFloat(fundingAmount);
    return available >= needed + 0.001; // Leave some for gas
  };

  const pkpHasBalance = () => {
    if (!pkpBalance) return false;
    return parseFloat(pkpBalance.formattedNative) > 0.001; // At least 0.001 ETH
  };

  const handleFundPKP = async () => {
    if (!signer || !vincentUser?.pkpAddress || !isWalletConnected) {
      toast.error('Connect both wallet and Vincent first');
      return;
    }

    if (!hasEnoughBalance()) {
      toast.error('Insufficient balance for funding + gas fees');
      return;
    }

    // Ensure we're on Base Sepolia for funding
    if (chainId !== 84532) {
      toast.error('Switch to Base Sepolia to fund PKP');
      return;
    }

    setIsFunding(true);
    setFundingStep('funding');

    try {
      const amountWei = parseUnits(fundingAmount, 18);
      
      toast.loading('Sending ETH to Vincent PKP...');

      // Send ETH from EOA to PKP
      const tx = await signer.sendTransaction({
        to: vincentUser.pkpAddress,
        value: amountWei.toString(),
      });

      setFundingStep('confirming');
      toast.dismiss();
      toast.loading('Confirming transaction...');

      const receipt = await tx.wait();
      
      setFundingStep('complete');
      toast.dismiss();
      toast.success(`PKP funded successfully! TX: ${receipt?.hash}`);

      // Refresh balances
      setTimeout(() => {
        refetchEOABalance();
        refetchPKPBalance();
      }, 2000);

      // Call completion callback after a short delay
      setTimeout(() => {
        onFundingComplete();
      }, 3000);

    } catch (error: any) {
      console.error('PKP funding failed:', error);
      toast.dismiss();
      toast.error(`Funding failed: ${error.message || 'Unknown error'}`);
      setFundingStep('ready');
    } finally {
      setIsFunding(false);
    }
  };

  // Auto-complete if PKP already has balance
  useEffect(() => {
    if (pkpHasBalance() && fundingStep === 'ready') {
      setFundingStep('complete');
      setTimeout(() => {
        onFundingComplete();
      }, 1000);
    }
  }, [pkpBalance, fundingStep, onFundingComplete]);

  if (!isWalletConnected || !isVincentAuthenticated) {
    return (
      <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
        <div className="flex items-center gap-2 text-yellow-400 mb-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Authentication Required</span>
        </div>
        <p className="text-yellow-300/80">
          Connect both your Web3 wallet and authenticate Vincent to continue
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent mb-2">
          Fund Vincent PKP Wallet
        </h2>
        <p className="text-gray-400">
          Transfer ETH from your Web3 wallet to your Vincent PKP to enable automated operations
        </p>
      </div>

      {/* Funding Flow Visualization */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {/* EOA Wallet */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mb-2">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-white">Your Wallet (EOA)</div>
            <div className="text-xs text-gray-400 font-mono">
              {formatAddress(walletAddress || '')}
            </div>
            <div className="text-xs text-blue-400">
              {eoaBalanceLoading ? 'Loading...' : `${formatBalance(eoaBalance?.formattedNative || '0')} ETH`}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center">
          <ArrowRight className={`h-8 w-8 ${fundingStep === 'complete' ? 'text-green-400' : 'text-orange-400'}`} />
          <div className="text-xs text-gray-400 mt-1">Transfer</div>
        </div>

        {/* PKP Wallet */}
        <div className="flex flex-col items-center">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-2 ${
            fundingStep === 'complete' ? 'bg-green-500' : 'bg-orange-500'
          }`}>
            {fundingStep === 'complete' ? (
              <CheckCircle className="h-8 w-8 text-white" />
            ) : (
              <Shield className="h-8 w-8 text-white" />
            )}
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-white">Vincent PKP</div>
            <div className="text-xs text-gray-400 font-mono">
              {formatAddress(vincentUser?.pkpAddress || '')}
            </div>
            <div className={`text-xs ${pkpHasBalance() ? 'text-green-400' : 'text-gray-500'}`}>
              {pkpBalanceLoading ? 'Loading...' : `${formatBalance(pkpBalance?.formattedNative || '0')} ETH`}
            </div>
          </div>
        </div>
      </div>

      {/* Chain Check */}
      {chainId !== 84532 && (
        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Wrong Network</span>
            </div>
            <button
              onClick={() => switchChain(84532)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
            >
              Switch to Base Sepolia
            </button>
          </div>
          <p className="text-orange-300/80 text-sm mt-1">
            Switch to Base Sepolia to fund your Vincent PKP
          </p>
        </div>
      )}

      {/* Funding Form */}
      {fundingStep !== 'complete' && chainId === 84532 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Amount to Transfer (ETH)
            </label>
            <div className="relative">
              <input
                type="number"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(e.target.value)}
                placeholder="0.01"
                className="w-full p-4 pr-16 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors"
                step="0.001"
                min="0.001"
                max="1"
                disabled={isFunding}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                ETH
              </div>
            </div>
            
            {/* Balance Info */}
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-gray-400">
                Available: {formatBalance(eoaBalance?.formattedNative || '0')} ETH
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFundingAmount('0.005')}
                  className="text-orange-400 hover:text-orange-300 transition-colors text-xs"
                >
                  0.005
                </button>
                <button
                  onClick={() => setFundingAmount('0.01')}
                  className="text-orange-400 hover:text-orange-300 transition-colors text-xs"
                >
                  0.01
                </button>
                <button
                  onClick={() => setFundingAmount('0.05')}
                  className="text-orange-400 hover:text-orange-300 transition-colors text-xs"
                >
                  0.05
                </button>
              </div>
            </div>
          </div>

          {/* Validation Messages */}
          {!hasEnoughBalance() && parseFloat(fundingAmount) > 0 && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Insufficient balance (need extra for gas fees)</span>
            </div>
          )}

          {/* Fund Button */}
          <button
            onClick={handleFundPKP}
            disabled={isFunding || !hasEnoughBalance() || parseFloat(fundingAmount) <= 0}
            className="w-full p-4 bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isFunding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {fundingStep === 'funding' ? 'Sending...' : 'Confirming...'}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Fund Vincent PKP ({fundingAmount} ETH)
              </>
            )}
          </button>
        </div>
      )}

      {/* Success State */}
      {fundingStep === 'complete' && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-green-400 mb-2">PKP Funded Successfully!</h3>
            <p className="text-gray-400 mb-4">
              Your Vincent PKP now has {formatBalance(pkpBalance?.formattedNative || '0')} ETH and is ready for automated operations
            </p>
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <h4 className="text-sm font-medium text-green-400 mb-2">What's Next?</h4>
              <div className="text-sm text-green-300/80 space-y-1">
                <div>✓ PKP can now execute cross-chain bridges</div>
                <div>✓ PKP can perform token swaps automatically</div>
                <div>✓ PKP can deposit to GuardX vault with AI protection</div>
                <div>✓ All operations happen without manual signing</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <h4 className="text-sm font-medium text-blue-400 mb-2">Why Fund the PKP?</h4>
        <div className="text-sm text-blue-300/80 space-y-1">
          <div>• PKPs start empty and need ETH for gas fees</div>
          <div>• Once funded, PKP can execute operations automatically</div>
          <div>• Your EOA stays safe - only PKP interacts with DeFi protocols</div>
          <div>• Vincent abilities work through the funded PKP wallet</div>
        </div>
      </div>
    </div>
  );
};

export default PKPFundingFlow;