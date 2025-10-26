import React from 'react';
import { ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatAddress, formatDate } from '@/utils/format';

interface Transaction {
  hash: string;
  type: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: Date;
  value?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No transactions found</p>
        <p className="text-sm mt-2">Your transaction history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div key={tx.hash} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-4">
            {getStatusIcon(tx.status)}
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{tx.type}</p>
                <a
                  href={`https://sepolia.basescan.org/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <p className="text-sm text-gray-500">{formatAddress(tx.hash, 8)}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{getStatusText(tx.status)}</p>
            <p className="text-xs text-gray-500">{formatDate(tx.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionHistory;
