
import React from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminLayout from "@/components/AdminLayout";
import FilterBar from "@/components/dashboard/FilterBar";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import ChartSection from "@/components/dashboard/ChartSection";
import RecentTicketsTable from "@/components/dashboard/RecentTicketsTable";
import DashboardLoader from "@/components/dashboard/DashboardLoader";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatConsistentIssueData } from "@/services/issues/issueProcessingService";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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

  const formattedRecentIssues = React.useMemo(() => {
    if (!recentIssues) return [];
    return formatConsistentIssueData(recentIssues);
  }, [recentIssues]);

  React.useEffect(() => {
    console.log("Dashboard current filters:", filters);
  }, [filters]);

  return (
    <AdminLayout title="Dashboard">
      {isLoading && !analytics ? (
        <DashboardLoader />
      ) : (
        <div className="space-y-6">
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
            recentIssues={formattedRecentIssues}
            isLoading={isLoading}
          />
        </div>
      )}
    </AdminLayout>
  );
};

const AdminDashboard = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
};

export default AdminDashboard;
