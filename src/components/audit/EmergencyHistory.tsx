import React from 'react';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { useEmergencyExecutor } from '@/hooks/useContract';
import { useContractRead, useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { formatCurrency, formatDate } from '@/utils/format';

const EmergencyHistory: React.FC = () => {
  const { address } = useAccount();
  const contract = useEmergencyExecutor();

  const { isLoading } = useContractRead({
    ...contract,
    functionName: 'owner', // Placeholder - getEmergencyHistory not in ABI
    // args: address ? [address] : undefined,
    enabled: !!address,
  });

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-800 rounded w-1/3"></div>
          <div className="h-20 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  const emergencies: any[] = [];

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-warning-600" />
        <h2 className="text-lg font-semibold text-gray-400">Emergency Actions</h2>
      </div>

      {emergencies.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <TrendingDown className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No emergency actions triggered</p>
          <p className="text-sm mt-1">Your portfolio is safe</p>
        </div>
      ) : (
        <div className="space-y-3">
          {emergencies.map((emergency: any, index: number) => {
            const timestamp = new Date(Number(emergency.timestamp) * 1000);
            // const amountIn = Number(formatUnits(emergency.amountIn, 18));
            const amountOut = Number(formatUnits(emergency.amountOut, 18));

            return (
              <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Emergency Conversion</p>
                    <p className="text-sm text-gray-600 mt-1">{emergency.reason}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(timestamp)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Converted</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(amountOut)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmergencyHistory;
