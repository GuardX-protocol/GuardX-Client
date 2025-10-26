import React from 'react';
import { useVincentAuth } from './VincentAuth';
import { Shield, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, initiateAuth } = useVincentAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="card text-center p-8 max-w-md w-full animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 bg-slate-800 rounded-2xl flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-[#ff4206] animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">
            Checking Authentication
          </h2>
          <p className="text-slate-400 mb-6">
            Verifying your Vincent session...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <div className="w-2 h-2 bg-[#ff4206] rounded-full animate-pulse"></div>
            <span>Powered by Lit Protocol</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="card text-center p-8 max-w-md w-full animate-slide-up">
          <div className="w-16 h-16 mx-auto mb-6 bg-slate-800 rounded-2xl flex items-center justify-center">
            <Shield className="h-8 w-8 text-[#ff4206]" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">
            Authentication Required
          </h2>
          <p className="text-slate-400 mb-8">
            Connect with Vincent to access GuardX's protected features and manage your portfolio securely.
          </p>
          <div className="space-y-3">
            <button
              onClick={initiateAuth}
              className="w-full px-6 py-3 bg-[#ff4206] hover:bg-[#e63900] text-white rounded-xl font-medium transition-colors"
            >
              Connect with Vincent
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-colors"
            >
              Go Back
            </button>
          </div>
          <div className="mt-6 p-4 bg-slate-800 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400">
              Your private keys remain secure. Vincent uses Lit Protocol's PKPs for non-custodial authentication.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;