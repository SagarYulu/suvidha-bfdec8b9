
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import ChartSection from '@/components/dashboard/ChartSection';
import RecentTicketsTable from '@/components/dashboard/RecentTicketsTable';
import FilterBar from '@/components/dashboard/FilterBar';
import DashboardLoader from '@/components/dashboard/DashboardLoader';
import { useDashboardData } from '@/hooks/useDashboardData';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Separate the inner component to use hooks
const DashboardContent = () => {
  const { 
    analytics,
    recentIssues,
    isLoading,
    userCount,
    handleFilterChange,
    typePieData,
    cityBarData,
    filters,
  } = useDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your issue management system</p>
      </div>

      {isLoading && !analytics ? (
        <DashboardLoader />
      ) : (
        <>
          <FilterBar 
            onFilterChange={handleFilterChange} 
            initialFilters={filters}
          />
          
          <DashboardMetrics 
            analytics={analytics} 
            userCount={userCount}
            isLoading={isLoading} 
          />

          <ChartSection 
            typePieData={typePieData}
            cityBarData={cityBarData}
            isLoading={isLoading}
          />

          <RecentTicketsTable 
            recentIssues={recentIssues}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
};

// Main component that provides the query client
const Dashboard = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
};

export default Dashboard;
