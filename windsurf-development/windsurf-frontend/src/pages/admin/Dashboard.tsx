
import React from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import ChartSection from '@/components/dashboard/ChartSection';
import RecentTicketsTable from '@/components/dashboard/RecentTicketsTable';

const Dashboard: React.FC = () => {
  const { hasPermission } = useRBAC();

  if (!hasPermission('view_dashboard')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to view the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your grievance portal dashboard</p>
      </div>

      <DashboardMetrics />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSection />
        <RecentTicketsTable />
      </div>
    </div>
  );
};

export default Dashboard;
