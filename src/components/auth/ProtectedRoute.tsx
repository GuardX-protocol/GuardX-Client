import React from 'react';
import { useVincentAuth } from './VincentAuth';
import { Shield, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, initiateAuth } = useVincentAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="card text-center p-8 max-w-md w-full animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-6 bg-gray-900 rounded-2xl flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">
            Checking Authentication
          </h2>
          <p className="text-gray-400 mb-6">
            Verifying your Vincent session...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Powered by Lit Protocol</span>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication required screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="card text-center p-8 max-w-md w-full animate-slide-up">
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-3">
            Authentication Required
          </h2>
          <p className="text-slate-600 mb-8">
            Connect with Vincent to access GuardX's protected features and manage your portfolio securely.
          </p>
          <div className="space-y-3">
            <button
              onClick={initiateAuth}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-sm"
            >
              Connect with Vincent
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition-colors"
            >
              Go Back
            </button>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-slate-600">
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