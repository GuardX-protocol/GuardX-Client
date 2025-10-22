import React, { useState, useMemo, useCallback } from 'react';
import { ArrowDown, AlertTriangle, CheckCircle2, Search, Wallet, ExternalLink } from 'lucide-react';
import { useAccount, useNetwork, useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseUnits } from 'viem';
import toast from 'react-hot-toast';
import { getContracts } from '@/config/contracts';
import { useTokenBalance, useTokenAllowance } from '@/hooks/useTokenBalance';
import { CrashGuardCoreABI } from '@/config/abis';
import { TokenInfo } from '@uniswap/token-lists';

// Simple token list for deposit
const DEPOSIT_TOKENS: TokenInfo[] = [
  {
    chainId: 421614,
    address: '0x0000000000000000000000000000000000000000',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
  },
  {
    chainId: 421614,
    address: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
  },
  {
    chainId: 421614,
    address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png'
  },
  {
    chainId: 421614,
    address: '0x980B62Da83eFf3D4576C647993b0c1D7faf17c73',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/2518/small/weth.png'
  }
];

const DepositForm: React.FC = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const contracts = getContracts(chain?.id);

  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [amount, setAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if selected token is ETH
  const isETH = selectedToken?.address === '0x0000000000000000000000000000000000000000';

  // Filter tokens based on search
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return DEPOSIT_TOKENS;

    const query = searchQuery.toLowerCase();
    return DEPOSIT_TOKENS.filter(token =>
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Get balance for selected token
  const { formattedBalance, refetch: refetchBalance } = useTokenBalance(
    selectedToken?.address || '',
    selectedToken?.decimals || 18
  );

  const { allowance, refetch: refetchAllowance } = useTokenAllowance(
    selectedToken?.address || '',
    contracts.CrashGuardCore
  );

  // Check if approval is needed (only for ERC20 tokens, not ETH)
  const needsApproval = useMemo(() => {
    if (!selectedToken || !amount || isETH) return false;
    if (!allowance) return true; // Need approval if we don't have allowance data
    try {
      const amountBigInt = parseUnits(amount, selectedToken.decimals);
      return allowance < amountBigInt;
    } catch {
      return false;
    }
  }, [selectedToken, amount, allowance, isETH]);

  // Token approval (only for ERC20 tokens)
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