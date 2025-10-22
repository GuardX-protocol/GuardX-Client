import React, { useState } from 'react';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, CheckCircle, TrendingUp } from 'lucide-react';
import { useAccount, useDisconnect, useBalance, useNetwork } from 'wagmi';
import { useWeb3Modal } from '@web3modal/react';
import { formatAddress, formatCurrency } from '@/utils/format';
import { getChainMetadata } from '@/config/chains';
import { isChainDeployed } from '@/config/deployments';
import { usePortfolio } from '@/hooks';
import { formatUnits } from 'viem';
import toast from 'react-hot-toast';

const WalletButton: React.FC = () => {
  const { open } = useWeb3Modal();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { data: balance } = useBalance({ address });
  const { portfolio } = usePortfolio();

  const chainMetadata = chain ? getChainMetadata(chain.id) : null;
  const isDeployed = chain ? isChainDeployed(chain.id) : false;

  // Get portfolio value
  const portfolioData = portfolio as any;
  const totalValue = portfolioData
    ? Number(formatUnits(BigInt(portfolioData.totalValue || portfolioData[1] || 0), 18))
    : 0;

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsDropdownOpen(false);
    toast.success('Wallet disconnected');
  };

  if (!isConnected) {
    return (
      <button
        onClick={() => open()}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </button>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs text-gray-500">Connected</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatAddress(address || '', 4)}
              </p>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-[60]"
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-[70] overflow-hidden">
              {/* Account Info */}
              <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Your Address</p>
                    <p className="text-sm font-semibold text-gray-900 font-mono">
                      {formatAddress(address || '', 6)}
                    </p>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 group"
                    title="Disconnect Wallet"
                  >
                    <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                {/* Network */}
                {chainMetadata && (
                  <div className={`mb-3 flex items-center gap-2 px-3 py-2 bg-white rounded-lg border ${isDeployed ? 'border-success-200' : 'border-orange-200'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${isDeployed ? 'bg-success-500 animate-pulse' : 'bg-orange-500'
                      }`} />
                    <span className="text-sm">{chainMetadata.icon}</span>
                    <p className="text-xs font-medium text-gray-700 flex-1">{chainMetadata.name}</p>
                    {!isDeployed && (
                      <span className="text-xs text-orange-600 font-medium">Not deployed</span>
                    )}
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Native Balance */}
                  {balance && (
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-500">Wallet Balance</p>
                      <p className="text-sm font-bold text-gray-900">
                        {parseFloat(balance.formatted).toFixed(4)}
                      </p>
                      <p className="text-xs text-gray-500">{balance.symbol}</p>
                    </div>
                  )}

                  {/* Portfolio Value */}
                  {isDeployed && (
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-500">Portfolio</p>
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(totalValue)}
                      </p>
                      <p className="text-xs text-success-600 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Protected
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-2">
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {copied ? (
                    <CheckCircle className="h-5 w-5 text-success-600" />
                  ) : (
                    <Copy className="h-5 w-5 text-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {copied ? 'Copied!' : 'Copy Address'}
                  </span>
                </button>

                {chainMetadata && chainMetadata.explorer && (
                  <a
                    href={`${chainMetadata.explorer}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      View on {chainMetadata.shortName} Explorer
                    </span>
                  </a>
                )}

                <div className="my-2 border-t border-gray-200" />

                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-lg transition-colors text-red-600 border-t border-gray-200 mt-2 pt-4"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Disconnect Wallet</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default WalletButton;
