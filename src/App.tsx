import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { wagmiConfig } from '@/config/wagmi';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Deposit from '@/pages/Deposit';
import Policies from '@/pages/Policies';
import Audit from '@/pages/Audit';

import Prices from '@/pages/Prices';
import Admin from '@/pages/Admin';
import GlobalWalletModal from '@/components/wallet/GlobalWalletModal';
import ErrorBoundary from '@/components/ErrorBoundary';


import '@/styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute - matches our API call frequency
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

// Clear wagmi cache on startup to prevent QuotaExceededError
const clearWagmiCache = () => {
  try {
    const keysToRemove = [
      'wagmi.cache',
      'wagmi.store',
      'wagmi.wallet',
      'wagmi.connected',
      'wagmi.injected.shimDisconnect'
    ];

    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignore individual failures
      }
    });

    console.log('✅ Cleared wagmi cache on startup');
  } catch (error) {
    console.warn('Could not clear cache:', error);
  }
};

clearWagmiCache();

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={wagmiConfig}>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="deposit" element={<Deposit />} />
                <Route path="prices" element={<Prices />} />
                <Route path="policies" element={<Policies />} />
                <Route path="audit" element={<Audit />} />
                <Route path="admin" element={<Admin />} />
              </Route>
            </Routes>
          </Router>
          <GlobalWalletModal />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(31, 41, 55, 0.95)',
                color: '#f9fafb',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                borderRadius: '12px',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                padding: '16px',
                backdropFilter: 'blur(16px)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </WagmiConfig>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;