import React, { useState } from 'react';
import { FileText, Search } from 'lucide-react';
import EmergencyHistory from '@/components/audit/EmergencyHistory';
import TransactionHistory from '@/components/audit/TransactionHistory';
import { useAccount } from 'wagmi';

const Audit: React.FC = () => {
  const { isConnected } = useAccount();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual contract events
  const transactions: any[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
        </div>
      </div>

      {!isConnected && (
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-blue-800">Connect your wallet to view audit trail</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Transactions</h3>
          <p className="text-3xl font-bold text-primary-600">{transactions.length}</p>
        </div>

        <div className="card text-center">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Emergency Actions</h3>
          <p className="text-3xl font-bold text-warning-600">0</p>
        </div>

        <div className="card text-center">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Volume</h3>
          <p className="text-3xl font-bold text-success-600">$0.00</p>
        </div>
      </div>

      <EmergencyHistory />

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  );
};

export default Audit;