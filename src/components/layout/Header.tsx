import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, Home, DollarSign, Settings, BarChart3, FileText } from 'lucide-react';
import { VincentUserInfo } from '@/components/auth/VincentAuth';
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
        {/* Clean background with subtle border */}
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xl border-b border-slate-200"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-semibold text-slate-900">
                  GuardX
                </span>
                <span className="text-xs text-slate-500 -mt-0.5">Crash Protection</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center">
              <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-200">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive(item.path)
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
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
            <div className="flex items-center gap-4">
              {/* Temporarily disabled NetworkIndicator to fix Wagmi config issue */}
              {/* <div className="hidden md:block">
                <NetworkIndicator />
              </div> */}
              <VincentUserInfo />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 text-slate-600 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 z-40">
          <div className="bg-white border-b border-slate-200 shadow-lg">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="grid grid-cols-2 gap-3">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-medium transition-all ${
                        isActive(item.path)
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;