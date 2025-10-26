import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useGuardXUser } from '@/hooks/useGuardX';
import { usePortfolioData, usePolicyData } from '@/hooks';

interface UserFlowGuardProps {
  children: React.ReactNode;
  requireWallet?: boolean;
  requireProfile?: boolean;
  requireAssets?: boolean;
  requirePolicies?: boolean;
}

const UserFlowGuard: React.FC<UserFlowGuardProps> = ({
  children,
  requireWallet = false,
  requireProfile = false,
  requireAssets = false,
  requirePolicies = false,
}) => {
  const { isConnected, address } = useAccount();
  const { user } = useGuardXUser();
  const { portfolio } = usePortfolioData(address);
  const { policy } = usePolicyData(address);
  const location = useLocation();

  // Check wallet connection
  if (requireWallet && !isConnected) {
    return <Navigate to="/app/dashboard" state={{ from: location }} replace />;
  }

  // Check profile setup
  if (requireProfile && isConnected && !user) {
    return <Navigate to="/app/dashboard" state={{ from: location }} replace />;
  }

  // Check assets deposited
  if (requireAssets && isConnected) {
    const portfolioData = portfolio as any;
    let assetsCount = 0;
    
    if (portfolioData) {
      if (Array.isArray(portfolioData) && portfolioData.length >= 1) {
        const assets = portfolioData[0] || [];
        assetsCount = Array.isArray(assets) ? assets.length : 0;
      } else if (portfolioData.assets) {
        assetsCount = Array.isArray(portfolioData.assets) ? portfolioData.assets.length : 0;
      }
    }

    if (assetsCount === 0) {
      return <Navigate to="/app/deposit" state={{ from: location }} replace />;
    }
  }

  // Check protection policies
  if (requirePolicies && isConnected) {
    const policyData = policy as any;
    let isProtectionActive = false;

    if (policyData) {
      if (Array.isArray(policyData) && policyData.length >= 1) {
        const crashThreshold = Number(policyData[0] || 0);
        isProtectionActive = crashThreshold > 0;
      } else if (policyData.crashThreshold !== undefined) {
        const crashThreshold = Number(policyData.crashThreshold || 0);
        isProtectionActive = crashThreshold > 0;
      }
    }

    if (!isProtectionActive) {
      return <Navigate to="/app/policies" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
};

export default UserFlowGuard;