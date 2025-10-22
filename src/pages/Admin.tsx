import React from 'react';
import TokenManagement from '@/components/admin/TokenManagement';
import { Settings, Shield, Database, Activity } from 'lucide-react';

const Admin: React.FC = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 opacity-30 animate-pulse">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-1/10 left-1/2 w-0.5 h-0.5 bg-white rounded-full"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8 p-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/90 to-gray-900/80"></div>
          <div className="relative z-10 text-center p-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-cyan-500/30 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                <Settings className="h-10 w-10 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]">Admin Panel</h1>
            </div>
            <p className="text-gray-300 max-w-2xl mx-auto flex items-center justify-center gap-2">
              <Activity className="h-4 w-4 text-cyan-400" />
              Manage contract settings, supported tokens, and system configuration. 
              Owner privileges required for most operations.
            </p>
          </div>
        </div>

        {/* Admin Sections */}
        <div className="grid gap-8">
          {/* Token Management */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Database className="h-5 w-5 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">Token Management</h2>
            </div>
            <TokenManagement />
          </section>

          {/* Future Admin Components */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">System Status</h2>
            </div>
            <div className="p-6 bg-black/50 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
              <p className="text-gray-300">System monitoring and emergency controls coming soon...</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Admin;