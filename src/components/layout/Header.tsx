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
      {/* Futuristic curved navbar */}
      <div className="relative">
        {/* Background with blur and gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-xl"></div>
        
        {/* Curved bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative p-3 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl shadow-2xl">
                  <Shield className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent">
                  GuardX
                </span>
                <span className="text-xs text-gray-400 -mt-1">Crash Protection</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center">
              <div className="flex items-center bg-gray-900/50 backdrop-blur-sm rounded-full p-2 border border-gray-800/50">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`relative flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      {isActive(item.path) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full border border-cyan-500/30"></div>
                      )}
                      <Icon className="h-4 w-4 relative z-10" />
                      <span className="relative z-10">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <NetworkIndicator />
              </div>
              <VincentUserInfo />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-3 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-gray-800/50"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 z-40">
          <div className="bg-gray-900/98 backdrop-blur-xl border-t border-gray-800/50 shadow-2xl">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="grid grid-cols-2 gap-3">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-medium transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/50 border border-transparent'
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