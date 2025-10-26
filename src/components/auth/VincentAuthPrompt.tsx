import React from 'react';
import { Shield, ExternalLink, CheckCircle } from 'lucide-react';
import { redirectToVincentConnect } from '@/lib/vincentAuth';

interface VincentAuthPromptProps {
  onAuthorize?: () => void;
}

const VincentAuthPrompt: React.FC<VincentAuthPromptProps> = ({ onAuthorize }) => {
  const handleAuthorize = () => {
    if (onAuthorize) {
      onAuthorize();
    } else {
      redirectToVincentConnect();
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-purple-900/20 to-cyan-900/20 rounded-2xl border border-purple-500/30">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-purple-500/20 rounded-xl">
          <Shield className="h-8 w-8 text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            🔐 Authorization Required
          </h2>
          <p className="text-gray-300">
            GuardX needs your permission to execute protective operations on your behalf.
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-black/30 rounded-xl border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3">Requested Permissions:</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span><strong>deBridge</strong> - Cross-chain bridging for multi-chain protection</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span><strong>ERC20 Transfer</strong> - Token transfers for emergency swaps</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span><strong>ERC20 Approval</strong> - Token approvals for DEX operations</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleAuthorize}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        <Shield className="h-5 w-5" />
        Authorize with Vincent
        <ExternalLink className="h-4 w-4" />
      </button>

      <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
        <p className="text-xs text-cyan-300">
          <strong>Secure & Private:</strong> Your keys remain in your wallet. Vincent only executes
          operations you explicitly authorize. You can revoke permissions anytime.
        </p>
      </div>
    </div>
  );
};

export default VincentAuthPrompt;
