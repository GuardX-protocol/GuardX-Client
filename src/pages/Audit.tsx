import React, { useState, useEffect } from 'react';
import { FileText, Search, Activity, AlertTriangle, DollarSign, ExternalLink, ArrowUpRight, ArrowDownCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import EmergencyHistory from '@/components/audit/EmergencyHistory';
import TransactionHistory from '@/components/audit/TransactionHistory';
import { useAccount, useNetwork } from 'wagmi';
import { useGuardXAlerts } from '@/hooks/useGuardX';
import { formatUnits } from 'viem';

const Audit: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'transactions' | 'alerts' | 'emergency'>('transactions');
  
  const { alerts } = useGuardXAlerts();
  
  // Mock transaction data - in real app, fetch from contract events
  const [transactions, setTransactions] = useState<any[]>([]);
  
  useEffect(() => {
    // Mock some transaction data
    if (isConnected && address) {
      const mockTransactions = [
        {
          id: '1',
          type: 'deposit',
          token: 'ETH',
          amount: '0.5',
          value: '$1,250.00',
          hash: '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef123456',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'confirmed',
          gasUsed: '21000',
          gasPrice: '20',
        },
        {
          id: '2',
          type: 'withdraw',
          token: 'USDC',
          amount: '1000',
          value: '$1,000.00',
          hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'confirmed',
          gasUsed: '45000',
          gasPrice: '25',
        },
      ];
      setTransactions(mockTransactions);
    }
  }, [isConnected, address]);

  const filteredTransactions = transactions.filter(tx =>
    tx.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalVolume = transactions.reduce((sum, tx) => {
    const value = parseFloat(tx.value.replace('$', '').replace(',', ''));
    return sum + value;
  }, 0);

  const getExplorerUrl = (hash: string) => {
    if (chain?.id === 421614) return `https://sepolia.arbiscan.io/tx/${hash}`;
    if (chain?.id === 84532) return `https://sepolia.basescan.org/tx/${hash}`;
    return `https://etherscan.io/tx/${hash}`;
  };

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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <h3 className="text-sm font-medium text-gray-400 mb-2">AI Alerts</h3>
            <p className="text-3xl font-bold text-yellow-400">{alerts.length}</p>
          </div>

          <div className="group p-6 bg-black/50 rounded-2xl border border-gray-800/50 hover:border-cyan-500/70 transition-all duration-300 backdrop-blur-sm hover:bg-black/70 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] text-center">
            <div className="flex items-center justify-center mb-3">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Volume</h3>
            <p className="text-3xl font-bold text-green-400">${totalVolume.toLocaleString()}</p>
          </div>

          <div className="group p-6 bg-black/50 rounded-2xl border border-gray-800/50 hover:border-cyan-500/70 transition-all duration-300 backdrop-blur-sm hover:bg-black/70 shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] text-center">
            <div className="flex items-center justify-center mb-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Success Rate</h3>
            <p className="text-3xl font-bold text-green-400">100%</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1 bg-gray-900/50 rounded-xl border border-gray-700">
          <button
            onClick={() => setSelectedTab('transactions')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              selectedTab === 'transactions'
                ? 'bg-cyan-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Activity className="h-4 w-4" />
            Transactions
          </button>
          <button
            onClick={() => setSelectedTab('alerts')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              selectedTab === 'alerts'
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            AI Alerts
          </button>
          <button
            onClick={() => setSelectedTab('emergency')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              selectedTab === 'emergency'
                ? 'bg-red-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <XCircle className="h-4 w-4" />
            Emergency
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              {selectedTab === 'transactions' && 'Transaction History'}
              {selectedTab === 'alerts' && 'AI Crash Alerts'}
              {selectedTab === 'emergency' && 'Emergency Actions'}
            </h2>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${selectedTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {selectedTab === 'transactions' && (
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No transactions found</p>
                </div>
              ) : (
                filteredTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          tx.type === 'deposit' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {tx.type === 'deposit' ? (
                            <ArrowDownCircle className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white capitalize">{tx.type} {tx.token}</div>
                          <div className="text-sm text-gray-400">{tx.amount} {tx.token} • {tx.value}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-sm text-green-400 capitalize">{tx.status}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(tx.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <span>Gas: {tx.gasUsed} @ {tx.gasPrice} gwei</span>
                        <a
                          href={getExplorerUrl(tx.hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View on Explorer
                        </a>
                      </div>
                      <div className="font-mono">
                        {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {selectedTab === 'alerts' && (
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No crash alerts found</p>
                </div>
              ) : (
                alerts.slice(0, 10).map((alert, index) => (
                  <div key={index} className="p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{alert.symbol} Crash Alert</div>
                          <div className="text-sm text-gray-400">
                            -{alert.price_drop.toFixed(1)}% drop • {(alert.crash_probability * 100).toFixed(1)}% probability
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded text-xs mb-1 ${
                          alert.confidence_level === 'very_high' ? 'bg-red-500/20 text-red-400' :
                          alert.confidence_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {alert.confidence_level.replace('_', ' ')} confidence
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(alert.crash_detected_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded">
                      {alert.analysis.substring(0, 200)}...
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {selectedTab === 'emergency' && (
            <EmergencyHistory />
          )}
        </div>
      </div>
    </div>
  );
};

export default Audit;