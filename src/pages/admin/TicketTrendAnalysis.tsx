
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp } from "lucide-react";
import { getIssueAnalytics } from "@/services/issues/issueAnalyticsService";
import TrendChart from "@/components/trends/TrendChart";

const TicketTrendAnalysis = () => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('30days');

  // Fetch issue analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['issueAnalytics', timeRange],
    queryFn: () => getIssueAnalytics(timeRange),
  });

  return (
    <AdminLayout title="Ticket Trend Analysis">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Ticket Volume Trends</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="30days" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="7days" onClick={() => setTimeRange('7days')}>Last 7 Days</TabsTrigger>
                <TabsTrigger value="30days" onClick={() => setTimeRange('30days')}>Last 30 Days</TabsTrigger>
                <TabsTrigger value="90days" onClick={() => setTimeRange('90days')}>Last 90 Days</TabsTrigger>
              </TabsList>
              
              <TabsContent value="7days" className="mt-0">
                {isLoading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <TrendChart data={analyticsData?.volumeTrend || []} timeRange="7days" />
                )}
              </TabsContent>
              
              <TabsContent value="30days" className="mt-0">
                {isLoading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <TrendChart data={analyticsData?.volumeTrend || []} timeRange="30days" />
                )}
              </TabsContent>
              
              <TabsContent value="90days" className="mt-0">
                {isLoading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <TrendChart data={analyticsData?.volumeTrend || []} timeRange="90days" />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Resolution Time Trend</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <TrendChart 
                  data={analyticsData?.resolutionTimeTrend || []} 
                  timeRange={timeRange} 
                  dataKey="avgResolutionHours" 
                  label="Avg. Resolution Time (hours)"
                />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Ticket Type Distribution Trend</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <TrendChart 
                  data={analyticsData?.typeDistributionTrend || []} 
                  timeRange={timeRange}
                  isStacked={true}
                  label="Ticket Types"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TicketTrendAnalysis;
