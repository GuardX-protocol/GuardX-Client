import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import { useWalletModal } from '@/hooks/useWalletModal';
import NetworkIndicator from '@/components/ui/NetworkIndicator';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openWalletModal } = useWalletModal();

  const navigation = [
    { name: 'Dashboard', path: '/app/dashboard' },
    { name: 'Deposit', path: '/app/deposit' },
    { name: 'Policies', path: '/app/policies' },
    { name: 'Prices', path: '/app/prices' },
    { name: 'Audit', path: '/app/audit' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0e1a]/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl group-hover:scale-110 transition-transform">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">GuardX</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${isActive(item.path)
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isConnected && <NetworkIndicator />}
            {isConnected ? (
              <button
                onClick={() => disconnect()}
                className="btn-secondary px-4 py-2 text-sm"
              >
                {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
              </button>
            ) : (
              <button
                onClick={openWalletModal}
                className="btn-primary px-4 py-2 text-sm"
              >
                Connect Wallet
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0f1419]">
          <nav className="px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-all ${isActive(item.path)
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}


    </header>
  );
};

export default Header;