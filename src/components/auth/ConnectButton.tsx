import React from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { useVincentAuth } from './VincentAuth';
import { VincentUserInfo } from './VincentAuth';

const ConnectButton: React.FC = () => {
  const { isAuthenticated, isLoading, initiateAuth } = useVincentAuth();

  // Show loading state
  if (isLoading) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-gray-400 cursor-not-allowed"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="hidden sm:inline">Checking...</span>
      </button>
    );
  }

  // Show user info if authenticated
  if (isAuthenticated) {
    return <VincentUserInfo />;
  }

  // Show connect button if not authenticated
  return (
    <button
      onClick={initiateAuth}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-purple-600 transition-colors shadow-lg"
    >
      <Shield className="h-4 w-4" />
      <span className="hidden sm:inline">Connect</span>
    </button>
  );
};

export default ConnectButton;