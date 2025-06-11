
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Clock, Users } from 'lucide-react';
import AnalyticsDateRangeFilter from '@/components/admin/analytics/AnalyticsDateRangeFilter';
import AnalyticsExportSection from '@/components/admin/analytics/AnalyticsExportSection';
import SLAAnalysisSection from '@/components/admin/analytics/SLAAnalysisSection';
import TrendAnalysisSection from '@/components/admin/analytics/TrendAnalysisSection';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  const handleExport = async (type: string, format: string, dateRange: any) => {
    console.log('Exporting:', { type, format, dateRange });
    // Add export logic here
  };

  const mockMetrics = {
    totalIssues: 1245,
    resolvedIssues: 1089,
    avgResolutionTime: 2.4,
    customerSatisfaction: 4.2
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive analytics and insights</p>
        </div>

        <AnalyticsDateRangeFilter 
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Total Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMetrics.totalIssues}</div>
              <p className="text-xs text-green-600">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Resolved Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMetrics.resolvedIssues}</div>
              <p className="text-xs text-green-600">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Avg Resolution Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMetrics.avgResolutionTime}h</div>
              <p className="text-xs text-red-600">+0.2h from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Customer Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockMetrics.customerSatisfaction}/5</div>
              <p className="text-xs text-green-600">+0.1 from last month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="sla" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sla">SLA Analysis</TabsTrigger>
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="sla">
            <SLAAnalysisSection dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="trends">
            <TrendAnalysisSection dateRange={dateRange} />
          </TabsContent>

          <TabsContent value="export">
            <AnalyticsExportSection onExport={handleExport} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
