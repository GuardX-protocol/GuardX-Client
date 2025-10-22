import React, { useState, useMemo } from 'react';
import { ArrowDown, Wallet, AlertTriangle, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { useAccount, useNetwork, useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseUnits } from 'viem';
import toast from 'react-hot-toast';
import { getContracts } from '@/config/contracts';
import { useNetworkTokens } from '@/hooks/useNetworkTokens';

import { usePythPrices } from '@/hooks/usePythPrices';
import { useTokenBalance, useTokenAllowance } from '@/hooks/useTokenBalance';
import { useTokenSupport, useSupportedTokens } from '@/hooks/useSupportedTokens';
import { useUserWalletTokens } from '@/hooks/useUserWalletTokens';
import { CrashGuardCoreABI } from '@/config/abis';
import { TokenInfo } from '@uniswap/token-lists';
import { logTokenSupportInfo, isKnownToken } from '@/utils/contractAdmin';
import TokenDropdown from '@/components/ui/TokenDropdown';

const DepositForm: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { chainName } = useNetworkTokens();
  const contracts = getContracts(chain?.id);

  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [amount, setAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Get user wallet tokens (including stablecoins and testnet tokens)
  const { allUserTokens, tokensWithBalance, isLoading: walletLoading, hasTokens } = useUserWalletTokens();
  
  // Use fallback tokens if wallet tokens are not loaded yet
  const fallbackTokens = useMemo(() => [
    {
      chainId: chain?.id || 1,
      address: '0xA0b86a33E6441b8435b662f0E2d0B8B8B8B8B8B8',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
    {
      chainId: chain?.id || 1,
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 6,
    },
    {
      chainId: chain?.id || 1,
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      decimals: 18,
    },
  ] as TokenInfo[], [chain?.id]);

  const tokensToUse = allUserTokens.length > 0 ? allUserTokens : fallbackTokens;
  
  // Filter tokens by contract support
  const { supportedTokens, unsupportedTokens, isLoading: tokensLoading, supportedCount } = useSupportedTokens(tokensToUse);
  const { isSupported: selectedTokenSupported, isLoading: supportCheckLoading } = useTokenSupport(selectedToken?.address);

  // Debug info for token support
  React.useEffect(() => {
    if (chain?.id && contracts.CrashGuardCore && unsupportedTokens.length > 0) {
      logTokenSupportInfo(chain.id, contracts.CrashGuardCore);
    }
  }, [chain?.id, contracts.CrashGuardCore, unsupportedTokens.length]);

  // Get symbols from tokens for Pyth price fetching
  const tokenSymbols = useMemo(() =>
    tokensToUse.map(token => token.symbol),
    [tokensToUse]
  );

  const { priceMap } = usePythPrices(tokenSymbols);

  const { formattedBalance, refetch: refetchBalance } = useTokenBalance(
    selectedToken?.address || '',
    selectedToken?.decimals || 18
  );

  const { allowance, refetch: refetchAllowance } = useTokenAllowance(
    selectedToken?.address || '',
    contracts.CrashGuardCore
  );

  // Check if approval is needed
  const needsApproval = useMemo(() => {
    if (!selectedToken || !amount || !allowance) return false;
    try {
      const amountBigInt = parseUnits(amount, selectedToken.decimals);
      return allowance < amountBigInt;
    } catch {
      return false;
    }
  }, [selectedToken, amount, allowance]);

  // Token approval
  const { write: approveToken, data: approvalTx } = useContractWrite({
    address: selectedToken?.address as `0x${string}`,
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
    args: selectedToken ? [
      contracts.CrashGuardCore as `0x${string}`,
      parseUnits(amount || '0', selectedToken.decimals)
    ] : undefined,
    onSuccess: (data) => {
      console.log('🔄 Approval transaction sent:', {
        hash: data.hash,
        token: selectedToken?.symbol,
        amount,
        spender: contracts.CrashGuardCore,
        timestamp: new Date().toISOString()
      });
      toast.loading('Approving token...', { id: 'approval' });
    },
    onError: (error) => {
      console.error('❌ Approval failed:', error);
      toast.error(`Approval failed: ${error.message}`);
      setIsApproving(false);
    }
  });

  // Deposit transaction
  const { write: depositToken, data: depositTx } = useContractWrite({
    address: contracts.CrashGuardCore as `0x${string}`,
    abi: CrashGuardCoreABI,
    functionName: 'depositAsset',
    args: selectedToken ? [
      selectedToken.address as `0x${string}`,
      parseUnits(amount || '0', selectedToken.decimals)
    ] : undefined,
    onSuccess: (data) => {
      console.log('🚀 Deposit transaction sent:', {
        hash: data.hash,
        token: selectedToken?.symbol,
        amount,
        contract: contracts.CrashGuardCore,
        user: address,
        timestamp: new Date().toISOString()
      });
      toast.loading('Processing deposit...', { id: 'deposit' });
    },
    onError: (error) => {
      console.error('❌ Deposit failed:', error);
      toast.error(`Deposit failed: ${error.message}`);
    }
  });

  // Wait for approval confirmation
  useWaitForTransaction({
    hash: approvalTx?.hash,
    onSuccess: (receipt) => {
      console.log('✅ Approval confirmed:', {
        hash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: new Date().toISOString()
      });
      toast.dismiss('approval');
      toast.success('Token approved successfully!');
      setIsApproving(false);
      refetchAllowance();
    },
    onError: (error) => {
      console.error('❌ Approval confirmation failed:', error);
      toast.dismiss('approval');
      toast.error('Approval failed');
      setIsApproving(false);
    }
  });

  // Wait for deposit confirmation
  useWaitForTransaction({
    hash: depositTx?.hash,
    onSuccess: (receipt) => {
      console.log('✅ Deposit confirmed:', {
        hash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: new Date().toISOString()
      });
      toast.dismiss('deposit');
      toast.success('Deposit successful! 🎉');
      setAmount('');
      refetchBalance();
      refetchAllowance();
    },
    onError: (error) => {
      console.error('❌ Deposit confirmation failed:', error);
      toast.dismiss('deposit');
      toast.error('Deposit failed');
    }
  });

  const handleApprove = () => {
    if (!selectedToken || !amount) return;
    setIsApproving(true);
    approveToken?.();
  };

  const handleDeposit = () => {
    if (!selectedToken || !amount) return;
    depositToken?.();
  };

  const handleMaxClick = () => {
    setAmount(formattedBalance);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getExplorerUrl = (hash: string) => {
    const explorers = {
      421614: 'https://sepolia.arbiscan.io/tx/',
      84532: 'https://sepolia.basescan.org/tx/',
      1: 'https://etherscan.io/tx/',
    };
    return explorers[chain?.id as keyof typeof explorers] + hash;
  };

  const estimatedValue = useMemo(() => {
    if (!selectedToken || !amount) return '0.00';
    const price = priceMap.get(selectedToken.symbol.toUpperCase());
    return price ? (parseFloat(amount) * price.price).toFixed(2) : '0.00';
  }, [selectedToken, amount, priceMap]);

  if (!isConnected) {
    return (
      <div className="card text-center">
        <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-100 mb-2">Connect Wallet</h3>
        <p className="text-gray-400">Connect your wallet to start depositing assets</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Deposit Assets</h2>
        <p className="text-gray-400">Add assets to your protected portfolio</p>
      </div>

      <div className="space-y-6">
        {/* Network Info */}
        {chainName && (
          <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
            <p className="text-sm text-blue-300">
              <span className="font-medium">Network:</span> {chainName} •
              <span className="font-medium"> Supported Tokens:</span> {tokensLoading ? '...' : supportedCount}/{tokensToUse.length}
              {hasTokens && (
                <>
                  {' • '}
                  <span className="font-medium text-emerald-300">Wallet Tokens:</span> {tokensWithBalance.length}
                </>
              )}
            </p>
          </div>
        )}

        {/* Wallet Balance Info */}
        {hasTokens && (
          <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-xl">
            <div className="flex items-start space-x-3">
              <Wallet className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-300">Wallet Connected</p>
                <p className="text-xs text-emerald-400 mt-1">
                  Found {tokensWithBalance.length} token{tokensWithBalance.length > 1 ? 's' : ''} with balance in your wallet.
                  All tokens (including stablecoins) are available for deposit.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Token Support Warning */}
        {unsupportedTokens.length > 0 && !tokensLoading && (
          <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-300">Some tokens not supported</p>
                <p className="text-xs text-amber-400 mt-1">
                  {unsupportedTokens.length} token{unsupportedTokens.length > 1 ? 's' : ''} cannot be deposited yet.
                  Only supported tokens are shown below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Token Selection */}
        <div>
          <label className="label">
            Select Token
            {tokensLoading && <span className="text-xs text-gray-400 ml-2">(Loading...)</span>}
          </label>

          {supportedTokens.length === 0 && !tokensLoading ? (
            <div className="p-6 text-center border-2 border-dashed border-gray-600 rounded-xl bg-gray-800/30">
              <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-300">No supported tokens found</p>
              <p className="text-xs text-gray-400 mt-1">Contact admin to add token support</p>
            </div>
          ) : (
            <TokenDropdown
              tokens={supportedTokens}
              selectedToken={selectedToken}
              onSelect={setSelectedToken}
              priceMap={priceMap}
              isLoading={tokensLoading || walletLoading}
              placeholder="Choose a token to deposit"
              showBalances={true}
            />
          )}
        </div>

        {selectedToken && (
          <>
            {/* Token Support Status */}
            {supportCheckLoading ? (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">Checking token support...</p>
              </div>
            ) : !selectedTokenSupported ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Token Not Supported</p>
                    <p className="text-xs text-red-700 mt-1">
                      {selectedToken.symbol} ({selectedToken.address.slice(0, 6)}...{selectedToken.address.slice(-4)})
                      is not supported by the contract.
                    </p>
                    {(() => {
                      const tokenInfo = isKnownToken(selectedToken.address, chain?.id);
                      return tokenInfo.shouldBeSupported ? (
                        <p className="text-xs text-red-700 mt-2 font-medium">
                          ⚠️ This is a common token that should be supported. Contact admin to add it.
                        </p>
                      ) : (
                        <p className="text-xs text-red-700 mt-2">
                          Please select a different token or contact admin to add support.
                        </p>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-800">
                    {selectedToken.symbol} is supported ✓
                  </p>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="label">Amount</label>
                <button
                  onClick={handleMaxClick}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
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
                  className="input text-lg pr-24"
                  step="any"
                  min="0"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                  {selectedToken.logoURI && (
                    <img src={selectedToken.logoURI} alt={selectedToken.symbol} className="w-5 h-5 rounded-full" />
                  )}
                  <span className="text-sm font-medium text-gray-200">{selectedToken.symbol}</span>
                </div>
              </div>

              {amount && parseFloat(amount) > 0 && (
                <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                  <p className="text-sm text-blue-300">
                    Estimated value: <span className="font-semibold text-blue-200">${estimatedValue}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Approval Status */}
            {needsApproval && (
              <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-300">Approval Required</p>
                    <p className="text-xs text-amber-400 mt-1">
                      Approve {selectedToken.symbol} spending to continue
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={needsApproval ? handleApprove : handleDeposit}
              disabled={
                !amount ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) > parseFloat(formattedBalance) ||
                isApproving ||
                !selectedTokenSupported ||
                supportCheckLoading
              }
              className="btn-primary w-full py-4 text-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {needsApproval ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{isApproving ? 'Approving...' : `Approve ${selectedToken.symbol}`}</span>
                </>
              ) : (
                <>
                  <ArrowDown className="h-5 w-5" />
                  <span>Deposit {selectedToken.symbol}</span>
                </>
              )}
            </button>

            {/* Transaction Links */}
            {(approvalTx || depositTx) && (
              <div className="space-y-2">
                {approvalTx && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Approval TX</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(approvalTx.hash)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <a
                        href={getExplorerUrl(approvalTx.hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}
                {depositTx && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Deposit TX</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(depositTx.hash)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <a
                        href={getExplorerUrl(depositTx.hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DepositForm;