import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, Home, DollarSign, Settings, BarChart3, FileText } from 'lucide-react';
import { VincentUserInfo } from '@/components/auth/VincentAuth';
import WalletButton from '@/components/wallet/WalletButton';
import NetworkIndicator from '@/components/ui/NetworkIndicator';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', path: '/app/dashboard', icon: Home },
    { name: 'Deposit', path: '/app/deposit', icon: DollarSign },
    { name: 'Policies', path: '/app/policies', icon: Settings },
    { name: 'Prices', path: '/app/prices', icon: BarChart3 },
    { name: 'Audit', path: '/app/audit', icon: FileText },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50">
      <div className="relative">
        <div className="absolute inset-0 backdrop-blur-xl border-b" style={{ backgroundColor: 'rgba(3, 8, 18, 0.95)', borderColor: '#1a1f2e' }}></div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2.5 bg-[#ff4206] rounded-xl transition-all group-hover:bg-[#e63900]">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-semibold text-white">
                  GuardX
                </span>
                <span className="text-xs text-gray-400 -mt-0.5">Crash Protection</span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center">
              <div className="flex items-center rounded-xl p-1 border" style={{ backgroundColor: '#0f1419', borderColor: '#1a1f2e' }}>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(item.path)
                        ? 'bg-slate-700 text-[#ff4206]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Network Indicator */}
              <div className="hidden md:block">
                <NetworkIndicator />
              </div>

              {/* MetaMask Wallet Connection */}
              <div className="hidden sm:block">
                <WalletButton />
              </div>

              {/* Vincent Authentication */}
              <VincentUserInfo />

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 z-40">
          <div className="bg-slate-900 border-b border-slate-800">
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
              {/* Mobile Wallet Connection */}
              <div className="sm:hidden">
                <WalletButton />
              </div>

              {/* Navigation Links */}
              <div className="grid grid-cols-2 gap-3">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-medium transition-all ${isActive(item.path)
                        ? 'bg-slate-800 text-[#ff4206] border border-slate-700'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700'
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className='pt-5'>
                <NetworkIndicator />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;