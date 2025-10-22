import React, { useState } from 'react';
import { FileText, Search, Activity, AlertTriangle, DollarSign } from 'lucide-react';
import EmergencyHistory from '@/components/audit/EmergencyHistory';
import TransactionHistory from '@/components/audit/TransactionHistory';
import { useAccount } from 'wagmi';

const Audit: React.FC = () => {
  const { isConnected } = useAccount();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual contract events
  const transactions: any[] = [];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 opacity-30 animate-pulse">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-1/10 left-1/2 w-0.5 h-0.5 bg-white rounded-full"></div>
        </div>
      </div>

      <div className="relative z-10 space-y-6 p-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/90 to-gray-900/80"></div>
          <div className="relative z-10 flex items-center justify-between p-8">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-cyan-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                <FileText className="h-10 w-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,197,94,0.3)] mb-2">Audit Trail</h1>
                <p className="text-gray-300 text-sm sm:text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  Complete transaction and emergency history
                </p>
              </div>
            </div>
          </div>
        </div>

        {!isConnected && (
          <div className="p-6 bg-black/50 rounded-2xl border border-cyan-500/30 backdrop-blur-sm shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <p className="text-gray-300">Connect your wallet to view audit trail</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group p-6 bg-black/50 rounded-2xl border border-gray-800/50 hover:border-cyan-500/70 transition-all duration-300 backdrop-blur-sm hover:bg-black/70 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] text-center">
            <div className="flex items-center justify-center mb-3">
              <Activity className="h-6 w-6 text-cyan-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Transactions</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{transactions.length}</p>
          </div>

          <div className="group p-6 bg-black/50 rounded-2xl border border-gray-800/50 hover:border-cyan-500/70 transition-all duration-300 backdrop-blur-sm hover:bg-black/70 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] text-center">
            <div className="flex items-center justify-center mb-3">
              <AlertTriangle className="h-6 w-6 text-yellow-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Emergency Actions</h3>
            <p className="text-3xl font-bold text-yellow-400">0</p>
          </div>

          <div className="group p-6 bg-black/50 rounded-2xl border border-gray-800/50 hover:border-cyan-500/70 transition-all duration-300 backdrop-blur-sm hover:bg-black/70 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] text-center">
            <div className="flex items-center justify-center mb-3">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Volume</h3>
            <p className="text-3xl font-bold text-green-400">$0.00</p>
          </div>
        </div>

        <EmergencyHistory />

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-400">Transaction History</h2>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-black/35 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <TransactionHistory transactions={transactions} />
        </div>
      </div>
    </div>
  );
};

export default Audit;