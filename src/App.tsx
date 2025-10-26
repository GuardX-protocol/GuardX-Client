import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiConfig } from 'wagmi';
import { Toaster } from 'react-hot-toast';
import { wagmiConfig } from '@/config/wagmi';
import { VincentAuthProvider } from '@/components/auth/VincentAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/layout/Layout';
import VincentDebug from '@/components/debug/VincentDebug';
import WagmiTest from '@/components/debug/WagmiTest';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import Deposit from '@/pages/Deposit';
import Policies from '@/pages/Policies';
import Audit from '@/pages/Audit';
import Prices from '@/pages/Prices';
import Admin from '@/pages/Admin';
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
          <VincentAuthProvider>
            <Router>
              <Routes>
                {/* Home page without layout */}
                <Route path="/" element={<Home />} />

                {/* App pages with layout - Protected by Vincent authentication */}
                <Route path="/app" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
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
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#0f172a',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                  style: {
                    border: '1px solid #d1fae5',
                    background: '#f0fdf4',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                  style: {
                    border: '1px solid #fecaca',
                    background: '#fef2f2',
                  },
                },
              }}
            />
            {/* Temporarily disabled VincentDebug to check Wagmi config */}
            {/* <VincentDebug /> */}
            {/* <WagmiTest /> */}
          </VincentAuthProvider>
        </WagmiConfig>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;