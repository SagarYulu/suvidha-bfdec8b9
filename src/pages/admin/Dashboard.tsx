
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import ChartSection from '@/components/dashboard/ChartSection';
import RecentTicketsTable from '@/components/dashboard/RecentTicketsTable';
import FilterBar from '@/components/dashboard/FilterBar';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import CompleteProjectBackup from '@/components/admin/CompleteProjectBackup';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Package } from 'lucide-react';

const Dashboard = () => {
  const {
    metricsData,
    chartData,
    recentTickets,
    isLoading,
    filters,
    handleFilterChange
  } = useDashboardData();

  if (isLoading) {
    return <DashboardLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Backup Alert Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Package className="h-5 w-5" />
            Project Backup Available
          </CardTitle>
          <CardDescription className="text-blue-700">
            Before proceeding with migration, create a complete backup of your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompleteProjectBackup />
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      
      {/* Metrics Cards */}
      <DashboardMetrics data={metricsData} />
      
      {/* Charts Section */}
      <ChartSection data={chartData} />
      
      {/* Recent Tickets Table */}
      <RecentTicketsTable tickets={recentTickets} />
    </div>
  );
};

export default Dashboard;
