
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalyticsDateRangeFilter from '@/components/admin/analytics/AnalyticsDateRangeFilter';
import TrendAnalysisSection from '@/components/admin/analytics/TrendAnalysisSection';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [activeTab, setActiveTab] = useState('overview');

  const mockMetrics = [
    {
      title: 'Total Issues',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: BarChart3
    },
    {
      title: 'Resolution Rate',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: TrendingUp
    },
    {
      title: 'Active Users',
      value: '456',
      change: '-2%',
      trend: 'down',
      icon: Users
    },
    {
      title: 'Avg Response Time',
      value: '2.4h',
      change: '-15%',
      trend: 'up',
      icon: Clock
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <AnalyticsDateRangeFilter
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>
          
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mockMetrics.map((metric, index) => {
                    const Icon = metric.icon;
                    const isPositive = metric.trend === 'up';
                    
                    return (
                      <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{metric.value}</div>
                          <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {metric.change} from last month
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="trends" className="space-y-6">
                <TrendAnalysisSection filters={{}} />
              </TabsContent>
              
              <TabsContent value="performance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Performance analytics coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
