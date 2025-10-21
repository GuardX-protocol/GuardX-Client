import React, { useState } from 'react';
import { CheckCircle, Circle, ArrowRight, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import ContractInfo from '@/components/ui/ContractInfo';
import WalletModal from '@/components/wallet/WalletModal';
import { useAccount } from 'wagmi';

const Onboarding: React.FC = () => {
  const { isConnected } = useAccount();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const steps = [
    { id: 1, title: 'Connect Wallet', completed: isConnected, current: !isConnected },
    { id: 2, title: 'Deposit Assets', completed: false, current: isConnected },
    { id: 3, title: 'Configure Protection', completed: false, current: false },
    { id: 4, title: 'Start Monitoring', completed: false, current: false },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to GuardX</h1>
        <p className="text-lg text-gray-600">Let's set up your automated crash protection</p>
      </div>

      <div className="card">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle className="h-6 w-6 text-success-600" />
                ) : step.current ? (
                  <div className="h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{step.id}</span>
                  </div>
                ) : (
                  <Circle className="h-6 w-6 text-gray-300" />
                )}
              </div>
              <div className="ml-4 flex-1">
                <h3 className={`text-sm font-medium ${step.current ? 'text-primary-600' : step.completed ? 'text-success-600' : 'text-gray-500'
                  }`}>
                  {step.title}
                </h3>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-300 ml-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Step Content */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {isConnected ? 'Step 2: Deposit Assets' : 'Step 1: Connect Your Wallet'}
            </h2>
          </div>

          {!isConnected ? (
            <>
              <p className="text-gray-600 mb-6">
                To get started with GuardX, connect your wallet to access crash protection features.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">What you'll get:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Real-time portfolio monitoring</li>
                    <li>• Automated crash protection</li>
                    <li>• Emergency asset conversion</li>
                    <li>• Cross-chain coordination</li>
                  </ul>
                </div>

                <Button className="w-full" onClick={() => setIsWalletModalOpen(true)}>
                  Connect Wallet to Continue
                </Button>
                <WalletModal
                  isOpen={isWalletModalOpen}
                  onClose={() => setIsWalletModalOpen(false)}
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Great! Your wallet is connected. Now deposit assets to start protecting your portfolio.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-success-50 rounded-lg border border-success-200">
                  <h3 className="font-medium text-success-900 mb-2">Next Steps:</h3>
                  <ul className="text-sm text-success-800 space-y-1">
                    <li>• Navigate to Deposit page</li>
                    <li>• Add tokens to your protected portfolio</li>
                    <li>• Configure protection policies</li>
                    <li>• Monitor your dashboard</li>
                  </ul>
                </div>

                <Button className="w-full" onClick={() => window.location.href = '/deposit'}>
                  Go to Deposit Page
                </Button>
              </div>
            </>
          )}
        </div>

        <ContractInfo />
      </div>
    </div>
  );
};

export default Onboarding;