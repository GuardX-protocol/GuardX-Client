import React from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import NetworkIndicator from '@/components/ui/NetworkIndicator';
import WalletButton from '@/components/wallet/WalletButton';
import { Shield, Menu, X } from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const { isConnected } = useAccount();

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">GuardX</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            >
              Dashboard
            </Link>
            <Link
              to="/deposit"
              className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            >
              Deposit
            </Link>
            <Link
              to="/prices"
              className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            >
              Prices
            </Link>

            <Link
              to="/policies"
              className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            >
              Policies
            </Link>
            <Link
              to="/audit"
              className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            >
              Audit
            </Link>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center gap-3">
            {isConnected && <NetworkIndicator />}
            <WalletButton />

            {/* Mobile menu button */}
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
              onClick={onMobileMenuToggle}
            >
              Dashboard
            </Link>
            <Link
              to="/deposit"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
              onClick={onMobileMenuToggle}
            >
              Deposit
            </Link>
            <Link
              to="/prices"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
              onClick={onMobileMenuToggle}
            >
              Prices
            </Link>
            <Link
              to="/policies"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
              onClick={onMobileMenuToggle}
            >
              Policies
            </Link>
            <Link
              to="/audit"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
              onClick={onMobileMenuToggle}
            >
              Audit
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;