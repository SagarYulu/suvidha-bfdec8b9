
import React from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import ChartSection from '@/components/dashboard/ChartSection';

const Analytics: React.FC = () => {
  const { hasPermission } = useRBAC();

  if (!hasPermission('view_analytics')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to view analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      </div>

      <ChartSection />
    </div>
  );
};

export default Analytics;
