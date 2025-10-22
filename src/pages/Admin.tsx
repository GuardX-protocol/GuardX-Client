import React from 'react';
import TokenManagement from '@/components/admin/TokenManagement';
import { Settings, Shield, Database } from 'lucide-react';

const Admin: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage contract settings, supported tokens, and system configuration. 
            Owner privileges required for most operations.
          </p>
        </div>

        {/* Admin Sections */}
        <div className="grid gap-8">
          {/* Token Management */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Database className="h-5 w-5 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">Token Management</h2>
            </div>
            <TokenManagement />
          </section>

          {/* Future Admin Components */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-gray-600">System monitoring and emergency controls coming soon...</p>
            </div>
          </section>
        </div>
      </div>
  );
};

export default Admin;