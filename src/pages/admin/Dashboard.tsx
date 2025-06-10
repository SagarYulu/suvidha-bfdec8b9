
import React from 'react';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import ChartSection from '@/components/dashboard/ChartSection';
import RecentTicketsTable from '@/components/dashboard/RecentTicketsTable';
import FilterBar from '@/components/dashboard/FilterBar';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const {
    analytics,
    recentIssues,
    isLoading,
    userCount,
    filters,
    handleFilterChange,
    typePieData,
    cityBarData
  } = useDashboardData();

  if (isLoading) {
    return <DashboardLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <FilterBar onFilterChange={handleFilterChange} initialFilters={filters} />
      
      {/* Metrics Cards */}
      <DashboardMetrics analytics={analytics} userCount={userCount} isLoading={isLoading} />
      
      {/* Charts Section */}
      <ChartSection typePieData={typePieData} cityBarData={cityBarData} isLoading={isLoading} />
      
      {/* Recent Tickets Table */}
      <RecentTicketsTable recentIssues={recentIssues} isLoading={isLoading} />
    </div>
  );
};

export default Dashboard;
