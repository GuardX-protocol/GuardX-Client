import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '@/config/wagmi';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Deposit from '@/pages/Deposit';
import Policies from '@/pages/Policies';
import Audit from '@/pages/Audit';
import Onboarding from '@/pages/Onboarding';
import Prices from '@/pages/Prices';
import ErrorBoundary from '@/components/ErrorBoundary';
import '@/styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Don't refetch automatically
      gcTime: 1000 * 60 * 30, // 30 minutes cache
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});

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
                <Route path="onboarding" element={<Onboarding />} />
              </Route>
            </Routes>
          </Router>
        </WagmiConfig>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;