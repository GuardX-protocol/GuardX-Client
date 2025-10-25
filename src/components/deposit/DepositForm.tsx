import React, { useState, useMemo, useCallback } from 'react';
import { ArrowDown, AlertTriangle, CheckCircle2, Search, Wallet, ExternalLink } from 'lucide-react';
import { useAccount, useNetwork, useContractWrite, useWaitForTransaction, useContractRead } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import toast from 'react-hot-toast';
import { VAULT_CONTRACTS, SUPPORTED_TOKENS, SupportedToken } from '@/config/vault';
import { VaultERC4626ABI, ERC20ABI } from '@/config/abis/vault';

const DepositForm: React.FC = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [selectedToken, setSelectedToken] = useState<SupportedToken | null>(null);
      </div>
    abi: ERC20ABI,
    functionName: 'mint',
    args: [address!, parseUnits('1000', 18)], // Mint 1000 mock tokens
  });

  // Handle approval
  const handleApprove = useCallback(async () => {
    if (!selectedToken || !amount) return;
    
    setIsApproving(true);
    try {
      approveToken?.();
    } catch (error) {
      toast.error('Failed to approve token');
      setIsApproving(false);
    }
  }, [selectedToken, amount, approveToken]);

  // Handle deposit
  const handleDeposit = useCallback(async () => {
    if (!selectedToken || !amount) return;

    try {
      depositToVault?.();
    } catch (error) {
      toast.error('Failed to deposit to vault');
    }
  }, [selectedToken, amount, depositToVault]);

  // Handle mint mock tokens
  const handleMintMock = useCallback(() => {
    if (selectedToken?.symbol === 'MOCK') {
      mintMockTokens?.();
      toast.success('Minting 1000 MOCK tokens...');
    }
  }, [selectedToken, mintMockTokens]);

  // Validation
  const isValidAmount = useMemo(() => {
    if (!amount || !selectedToken) return false;
    try {
      const amountBigInt = parseUnits(amount, selectedToken.decimals);
      return amountBigInt > 0n && (!tokenBalance || amountBigInt <= tokenBalance);
    } catch {
      return false;
    }
  }, [amount, selectedToken, tokenBalance]);

  if (!isCorrectNetwork) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Wrong Network</h3>
            <p className="text-gray-600 mb-4">
              Please switch to Base Sepolia (Chain ID: {VAULT_CONTRACTS.CHAIN_ID}) to use the vault.
            </p>
            <p className="text-sm text-gray-500">
              Current network: {chain?.name || 'Unknown'} (ID: {chain?.id || 'Unknown'})
            </p>
          </div>
        </div>
      </div>
    );
  }
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: '', type: 'bool' }]
      }
    ],
    functionName: 'approve',
    args: selectedToken && !isETH ? [
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
    value: selectedToken && isETH ? parseUnits(amount || '0', selectedToken.decimals) : undefined,
    onSuccess: (data) => {
      console.log('🚀 Deposit transaction sent:', {
        hash: data.hash,
        token: selectedToken?.symbol,
        amount,
        isETH,
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

  const handleMaxClick = useCallback(() => {
    setAmount(formattedBalance);
  }, [formattedBalance]);

  // Get minimum deposit amount based on token type
  const getMinimumDeposit = useCallback((token: TokenInfo): string => {
    if (token.address === '0x0000000000000000000000000000000000000000') {
      return '0.01'; // ETH: minimum 0.01 ETH
    } else if (token.symbol === 'USDC' || token.symbol === 'USDT') {
      return '1'; // Stablecoins: minimum 1 token
    } else {
      return '0.01'; // Other tokens: minimum 0.01 tokens
    }
  }, []);



  return (
    <div className="space-y-6">
      {/* Token Selection */}
      <div className="p-6 bg-gray-900 rounded-2xl border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Select Token</h3>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-gray-600 focus:outline-none"
          />
        </div>

        {/* Token List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredTokens.map((token) => {
            // Get balance for this token using the hook
            const { formattedBalance: tokenBalance } = useTokenBalance(
              token.address === '0x0000000000000000000000000000000000000000' ? '' : token.address,
              token.decimals
            );
            
            const hasBalance = parseFloat(tokenBalance) > 0;
            
            return (
              <button
                key={token.address}
                onClick={() => setSelectedToken(token)}
                className={`p-4 rounded-xl border transition-all text-left relative ${selectedToken?.address === token.address
                  ? 'border-cyan-400 bg-gray-800'
                  : 'border-gray-700 bg-black hover:border-gray-600'
                  }`}
              >
                {hasBalance && (
                  <div className="absolute -top-2 -right-2">
                    <div className="flex items-center gap-1 bg-cyan-400 text-black text-xs px-2 py-1 rounded-full font-medium">
                      <Wallet className="h-3 w-3" />
                      {parseFloat(tokenBalance).toFixed(4)}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  {token.logoURI ? (
                    <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{token.symbol.slice(0, 2)}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-white">{token.symbol}</p>
                    <p className="text-xs text-gray-400">{token.name}</p>
                    {hasBalance && (
                      <p className="text-xs text-cyan-400 mt-1">
                        Balance: {parseFloat(tokenBalance).toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount Input */}
      {selectedToken && (
        <div className="p-6 bg-gray-900 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <div>
              <p className="font-medium text-white">{selectedToken.symbol} Selected</p>
              <p className="text-xs text-gray-400">
                {isETH ? 'Native ETH deposit' : 'ERC20 token deposit'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Amount</label>
                <button
                  onClick={handleMaxClick}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
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
                  className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white text-lg focus:border-gray-600 focus:outline-none"
                  step="any"
                  min="0"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {selectedToken.logoURI && (
                    <img src={selectedToken.logoURI} alt={selectedToken.symbol} className="w-5 h-5 rounded-full" />
                  )}
                  <span className="text-sm font-medium text-gray-300">{selectedToken.symbol}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Minimum: {getMinimumDeposit(selectedToken)} {selectedToken.symbol}
              </p>
            </div>

            {/* Approval Status */}
            {needsApproval && (
              <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <p className="text-sm text-yellow-300">Approval required for {selectedToken.symbol}</p>
                </div>
              </div>
            )}

            {/* Validation */}
            {amount && parseFloat(amount) > 0 && parseFloat(amount) < parseFloat(getMinimumDeposit(selectedToken)) && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-xl">
                <p className="text-sm text-red-300">
                  Amount below minimum of {getMinimumDeposit(selectedToken)} {selectedToken.symbol}
                </p>
              </div>
            )}

            <button
              onClick={needsApproval ? handleApprove : handleDeposit}
              disabled={
                !amount ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) < parseFloat(getMinimumDeposit(selectedToken)) ||
                parseFloat(amount) > parseFloat(formattedBalance) ||
                isApproving
              }
              className="w-full py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {needsApproval ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {isApproving ? 'Approving...' : `Approve ${selectedToken.symbol}`}
                </>
              ) : (
                <>
                  <ArrowDown className="h-4 w-4" />
                  Deposit {selectedToken.symbol}
                </>
              )}
            </button>

            {/* Transaction Status */}
            {(approvalTx || depositTx) && (
              <div className="space-y-2 mt-4">
                {approvalTx && (
                  <div className="flex items-center justify-between p-3 bg-black rounded-xl border border-gray-800">
                    <span className="text-sm text-white">Approval Transaction</span>
                    <a
                      href={`https://sepolia.arbiscan.io/tx/${approvalTx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <span className="text-xs">View</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {depositTx && (
                  <div className="flex items-center justify-between p-3 bg-black rounded-xl border border-gray-800">
                    <span className="text-sm text-white">Deposit Transaction</span>
                    <a
                      href={`https://sepolia.arbiscan.io/tx/${depositTx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <span className="text-xs">View</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositForm;