
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, TrendingUp, Users, AlertCircle } from 'lucide-react';
import ExportDialog from '@/components/admin/export/ExportDialog';
import { useToast } from '@/hooks/use-toast';

const Analytics = () => {
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  
  const { toast } = useToast();

  // Mock analytics data - in real app this would come from API
  const analyticsData = {
    totalIssues: 1247,
    resolvedIssues: 892,
    avgResolutionTime: 18.5,
    userSatisfaction: 4.2,
    openIssues: 143,
    inProgressIssues: 212
  };

  const resolutionRate = ((analyticsData.resolvedIssues / analyticsData.totalIssues) * 100).toFixed(1);

  const exportFilters = {
    dateRange,
    // Add other filters as needed
  };

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
            <p className="text-muted-foreground">
              Comprehensive overview of system performance and metrics
            </p>
          </div>
          <ExportDialog 
            filters={exportFilters}
            trigger={
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            }
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalIssues.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All time issues reported
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolutionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Issues successfully resolved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.avgResolutionTime}h</div>
              <p className="text-xs text-muted-foreground">
                Average time to resolve
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.userSatisfaction}/5</div>
              <p className="text-xs text-muted-foreground">
                Average satisfaction rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Open Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{analyticsData.openIssues}</div>
              <p className="text-sm text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{analyticsData.inProgressIssues}</div>
              <p className="text-sm text-muted-foreground">Being worked on</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{analyticsData.resolvedIssues}</div>
              <p className="text-sm text-muted-foreground">Successfully completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Data Export</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <FileText className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">Issues Report</div>
                  <div className="text-xs text-gray-500">All issue details</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">Analytics Summary</div>
                  <div className="text-xs text-gray-500">Performance metrics</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2" />
                  <div className="font-medium">User Data</div>
                  <div className="text-xs text-gray-500">Employee information</div>
                </div>
              </Button>

              <ExportDialog 
                filters={exportFilters}
                trigger={
                  <Button variant="outline" className="h-auto p-4">
                    <div className="text-center">
                      <Download className="h-6 w-6 mx-auto mb-2" />
                      <div className="font-medium">All Data</div>
                      <div className="text-xs text-gray-500">Comprehensive export</div>
                    </div>
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
