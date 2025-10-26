import React from 'react';
import { ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { CONTRACTS, NETWORK_CONFIG } from '@/config/contracts';
import { formatAddress } from '@/utils/format';
import toast from 'react-hot-toast';

const ContractInfo: React.FC = () => {
  const [copiedAddress, setCopiedAddress] = React.useState<string | null>(null);

  const copyToClipboard = (address: string, name: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    toast.success(`${name} address copied!`);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const contracts = [
    { name: 'CrashGuardCore', address: CONTRACTS.CrashGuardCore },
    { name: 'PythPriceMonitor', address: CONTRACTS.PythPriceMonitor },
    { name: 'EmergencyExecutor', address: CONTRACTS.EmergencyExecutor },
    { name: 'PortfolioRebalancer', address: CONTRACTS.PortfolioRebalancer },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Addresses</h3>
      <div className="space-y-2">
        {contracts.map(({ name, address }) => (
          <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">{name}</p>
              <p className="text-xs text-gray-500 font-mono">{formatAddress(address, 6)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(address, name)}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Copy address"
              >
                {copiedAddress === address ? (
                  <CheckCircle className="h-4 w-4 text-success-600" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-600" />
                )}
              </button>
              <a
                href={`https://sepolia.basescan.org/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="View on BaseScan"
              >
                <ExternalLink className="h-4 w-4 text-gray-600" />
              </a>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-red-50 rounded-lg">
        <p className="text-xs text-red-800">
          <span className="font-medium">Network:</span> {NETWORK_CONFIG.network} (Chain ID: {NETWORK_CONFIG.chainId})
        </p>
      </div>
    </div>
  );
};

export default ContractInfo;
