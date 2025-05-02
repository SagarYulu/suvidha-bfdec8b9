
import React from "react";
import AdminLayout from "@/components/AdminLayout";
import FilterBar from "@/components/dashboard/FilterBar";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import ChartSection from "@/components/dashboard/ChartSection";
import RecentTicketsTable from "@/components/dashboard/RecentTicketsTable";
import DashboardLoader from "@/components/dashboard/DashboardLoader";
import { useDashboardData } from "@/hooks/useDashboardData";

const AdminDashboard = () => {
  const { 
    analytics,
    recentIssues,
    isLoading,
    userCount,
    handleFilterChange,
    typePieData,
    cityBarData
  } = useDashboardData();

  return (
    <AdminLayout title="Dashboard">
      {isLoading ? (
        <DashboardLoader />
      ) : (
        <div className="space-y-6">
          {/* Add FilterBar component */}
          <FilterBar onFilterChange={handleFilterChange} />
          
          {/* Dashboard Metrics */}
          <DashboardMetrics 
            analytics={analytics} 
            userCount={userCount}
            isLoading={isLoading} 
          />

          {/* Charts Section */}
          <ChartSection 
            typePieData={typePieData}
            cityBarData={cityBarData}
            isLoading={isLoading}
          />

          {/* Recent Tickets Table */}
          <RecentTicketsTable 
            recentIssues={recentIssues}
            isLoading={isLoading}
          />
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
