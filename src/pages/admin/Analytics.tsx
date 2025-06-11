
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import FilterBar from '@/components/dashboard/FilterBar';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import AnalyticsExportSection from '@/components/admin/analytics/AnalyticsExportSection';
import TrendAnalysisSection from '@/components/admin/analytics/TrendAnalysisSection';
import SLAAnalysisSection from '@/components/admin/analytics/SLAAnalysisSection';
import { useDashboardData } from '@/hooks/useDashboardData';

const Analytics: React.FC = () => {
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

  console.log("Analytics data:", { 
    analytics, 
    recentIssues: recentIssues?.length || 0,
    isLoading 
  });

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>

        <FilterBar 
          filters={filters}
          onFiltersChange={handleFilterChange}
        />
        
        <DashboardMetrics 
          analytics={analytics} 
          userCount={userCount}
          isLoading={isLoading} 
        />

        <AnalyticsExportSection 
          analytics={analytics}
          filters={filters}
          dateRange={{
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            to: new Date()
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendAnalysisSection />
          <SLAAnalysisSection />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
