import React, { useState, useMemo } from 'react';
import { 
  ArrowDown, 
  ArrowRight, 
  Wallet, 
  AlertTriangle, 
  Info, 
  Zap, 
  Globe,
  RefreshCw
} from 'lucide-react';
import { useAccount, useNetwork } from 'wagmi';
import { useWalletModal } from '@/hooks/useWalletModal';
import { useAllPythTokens } from '@/hooks/useAllPythTokens';
import { useCrossChainDeposit } from '@/hooks/useCrossChainDeposit';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { TokenInfo } from '@uniswap/token-lists';
import TokenDropdown from '@/components/ui/TokenDropdown';
import { formatMinimumDeposit } from '@/config/constants';

const CrossChainDepositForm: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { openWalletModal } = useWalletModal();

  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [amount, setAmount] = useState('');
  const [sourceChainId, setSourceChainId] = useState<number>(chain?.id || 421614);
  const [destinationChainId, setDestinationChainId] = useState<number>(84532);
  const [recipient, setRecipient] = useState<string>('');

  // Get all available tokens
  const { popularTokens, isLoading: tokensLoading } = useAllPythTokens();

  // Cross-chain deposit functionality
  const {
    isProcessing,
    currentStep,
    supportedChains,
    executeCrossChainDeposit,
    getEstimatedFees,
    isChainPairSupported,
    isCrossChain
  } = useCrossChainDeposit();

  // Token balance and allowance
  const { formattedBalance } = useTokenBalance(
    selectedToken?.address || '',
    selectedToken?.decimals || 18
  );

  // Use popular tokens for dropdown
  const tokensToUse = useMemo(() => {
    return popularTokens.slice(0, 20);
  }, [popularTokens]);

  const handleMaxClick = () => {
    setAmount(formattedBalance);
  };

  const handleDeposit = async () => {
    if (!selectedToken || !amount) return;

    await executeCrossChainDeposit({
      token: selectedToken,
      amount,
      sourceChainId,
      destinationChainId,
      recipient: recipient || address || ''
    });
  };

  const estimatedFees = useMemo(() => {
    return getEstimatedFees(sourceChainId, destinationChainId);
  }, [sourceChainId, destinationChainId, getEstimatedFees]);

  const isValidDeposit = useMemo(() => {
    if (!selectedToken || !amount || !isConnected) return false;
    
    const amountNum = parseFloat(amount);
    const balanceNum = parseFloat(formattedBalance);
    const minDeposit = parseFloat(formatMinimumDeposit(selectedToken.decimals));
    
    return amountNum > 0 && 
           amountNum >= minDeposit && 
           amountNum <= balanceNum &&
           isChainPairSupported(sourceChainId, destinationChainId);
  }, [selectedToken, amount, formattedBalance, isConnected, sourceChainId, destinationChainId, isChainPairSupported]);

  if (!isConnected) {
    return (
      <div className="p-8 bg-gray-900 rounded-3xl border border-gray-800 text-center">
        <div className="p-6 bg-black rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6 border border-gray-800">
          <Wallet className="h-12 w-12 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Connect Wallet</h3>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Connect your wallet to access cross-chain deposit functionality.
        </p>
        <button
          onClick={openWalletModal}
          className="px-8 py-4 bg-white text-black rounded-2xl font-medium hover:bg-gray-200 transition-all duration-300"
        >
          <span className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Connect Wallet
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-900 rounded-3xl border border-gray-800">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-black rounded-2xl border border-gray-800">
            <Globe className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Cross-Chain Deposit</h2>
            <p className="text-gray-400">Deposit tokens from any chain to any chain</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Chain Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Source Chain */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">From Chain</label>
            <select
              value={sourceChainId}
              onChange={(e) => setSourceChainId(Number(e.target.value))}
              className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white focus:border-gray-700 focus:outline-none"
            >
              {supportedChains.map((chain) => (
                <option key={chain.chainId} value={chain.chainId}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Chain */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">To Chain</label>
            <select
              value={destinationChainId}
              onChange={(e) => setDestinationChainId(Number(e.target.value))}
              className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white focus:border-gray-700 focus:outline-none"
            >
              {supportedChains.map((chain) => (
                <option key={chain.chainId} value={chain.chainId}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chain Route Indicator */}
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-4 p-4 bg-black rounded-xl border border-gray-800">
            <span className="text-white font-medium">
              {supportedChains.find(c => c.chainId === sourceChainId)?.name}
            </span>
            {isCrossChain(sourceChainId, destinationChainId) ? (
              <ArrowRight className="h-5 w-5 text-white" />
            ) : (
              <RefreshCw className="h-5 w-5 text-white" />
            )}
            <span className="text-white font-medium">
              {supportedChains.find(c => c.chainId === destinationChainId)?.name}
            </span>
          </div>
        </div>

        {/* Cross-chain Info */}
        {isCrossChain(sourceChainId, destinationChainId) && (
          <div className="p-4 bg-black rounded-xl border border-gray-800">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">Cross-Chain Deposit</p>
                <p className="text-xs text-gray-400 mt-1">
                  Your tokens will be bridged from {supportedChains.find(c => c.chainId === sourceChainId)?.name} to {supportedChains.find(c => c.chainId === destinationChainId)?.name}.
                  This may take a few minutes to complete.
                </p>
                <div className="mt-2 text-xs text-gray-400">
                  <p>Bridge Fee: ~{estimatedFees.bridgeFee} ETH</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Token Selection */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Select Token
            {tokensLoading && <span className="text-xs text-gray-400 ml-2">(Loading...)</span>}
          </label>
          <TokenDropdown
            tokens={tokensToUse}
            selectedToken={selectedToken}
            onSelect={setSelectedToken}
            priceMap={new Map()} // TODO: Add price map
            isLoading={tokensLoading}
            placeholder="Choose a token to deposit"
            showBalances={true}
          />
        </div>

        {selectedToken && (
          <>
            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-white">Amount</label>
                <button
                  onClick={handleMaxClick}
                  className="text-xs text-white hover:text-gray-300 font-medium transition-colors"
                >
                  Balance: {formattedBalance} {selectedToken.symbol}
                </button>
              </div>

              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full p-4 bg-black border border-gray-800 rounded-xl text-white text-lg pr-24 focus:border-gray-700 focus:outline-none"
                  step="any"
                  min="0"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                  {selectedToken.logoURI && (
                    <img src={selectedToken.logoURI} alt={selectedToken.symbol} className="w-5 h-5 rounded-full" />
                  )}
                  <span className="text-sm font-medium text-white">{selectedToken.symbol}</span>
                </div>
              </div>

              <div className="mt-3 p-3 bg-black border border-gray-800 rounded-xl">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-400">
                    <p className="font-medium mb-1">Minimum deposit: {formatMinimumDeposit(selectedToken.decimals)} {selectedToken.symbol}</p>
                    <p>Contract requires minimum $1 USD equivalent</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recipient Address (Optional) */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Recipient Address (Optional)
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={address || "Enter recipient address"}
                className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white focus:border-gray-700 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                Leave empty to deposit to your own address
              </p>
            </div>

            {/* Processing Status */}
            {isProcessing && currentStep && (
              <div className="p-4 bg-black border border-gray-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white font-medium">{currentStep}</span>
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {amount && selectedToken && (
              <>
                {parseFloat(amount) < parseFloat(formatMinimumDeposit(selectedToken.decimals)) && (
                  <div className="p-4 bg-black border border-gray-800 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-white mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">Amount Below Minimum</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Minimum deposit is {formatMinimumDeposit(selectedToken.decimals)} {selectedToken.symbol}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {parseFloat(amount) > parseFloat(formattedBalance) && (
                  <div className="p-4 bg-black border border-gray-800 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-white mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">Insufficient Balance</p>
                        <p className="text-xs text-gray-400 mt-1">
                          You only have {formattedBalance} {selectedToken.symbol}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Deposit Button */}
            <button
              onClick={handleDeposit}
              disabled={!isValidDeposit || isProcessing}
              className="w-full py-4 text-lg flex items-center justify-center space-x-2 bg-white text-black rounded-2xl font-medium hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : isCrossChain(sourceChainId, destinationChainId) ? (
                <>
                  <Globe className="h-5 w-5" />
                  <span>Bridge & Deposit {selectedToken.symbol}</span>
                </>
              ) : (
                <>
                  <ArrowDown className="h-5 w-5" />
                  <span>Deposit {selectedToken.symbol}</span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CrossChainDepositForm;