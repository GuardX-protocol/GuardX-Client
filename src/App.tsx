import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { wagmiConfig } from '@/config/wagmi';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
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

// Only clear cache if there's a quota issue, preserve wallet connection
const clearWagmiCacheIfNeeded = () => {
  try {
    // Check if localStorage is near quota
    const testKey = 'wagmi.test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
  } catch (error) {
    // Only clear cache if we have quota issues
    if (error instanceof DOMException && error.code === 22) {
      console.warn('LocalStorage quota exceeded, clearing wagmi cache');
      try {
        const keysToRemove = ['wagmi.cache'];
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (e) {
        console.warn('Could not clear cache:', e);
      }
    }
  }
};

clearWagmiCacheIfNeeded();

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={wagmiConfig}>
          <Router>
            <Routes>
              {/* Home page without layout */}
              <Route path="/" element={<Home />} />
              
              {/* App pages with layout */}
              <Route path="/app" element={<Layout />}>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="deposit" element={<Deposit />} />
                <Route path="prices" element={<Prices />} />
                <Route path="policies" element={<Policies />} />
                <Route path="audit" element={<Audit />} />
                <Route path="admin" element={<Admin />} />
              </Route>
              
              {/* Legacy redirects */}
              <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/deposit" element={<Navigate to="/app/deposit" replace />} />
              <Route path="/prices" element={<Navigate to="/app/prices" replace />} />
              <Route path="/policies" element={<Navigate to="/app/policies" replace />} />
              <Route path="/audit" element={<Navigate to="/app/audit" replace />} />
              <Route path="/admin" element={<Navigate to="/app/admin" replace />} />
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