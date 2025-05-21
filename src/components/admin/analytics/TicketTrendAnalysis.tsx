
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, Label
} from "recharts";
import { AdvancedFilters } from "./types";
import { useAdvancedAnalytics } from "@/hooks/useAdvancedAnalytics";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TicketTrendAnalysisProps {
  filters: AdvancedFilters;
}

export const TicketTrendAnalysis = ({ filters }: TicketTrendAnalysisProps) => {
  const [activeTab, setActiveTab] = useState<string>("resolution-time");
  const { data, isLoading, error } = useAdvancedAnalytics(filters);

  console.log("Ticket Trend Analysis rendered with filters:", filters);
  console.log("Ticket Trend Data:", { data, isLoading, error });

  // Mock data for visualization - in a real implementation, this would come from the API
  // using the filters passed in from the parent component
  const [trendData, setTrendData] = useState<any>([]);
  const [statusData, setStatusData] = useState<any>([]);
  const [priorityData, setPriorityData] = useState<any>([]);
  
  useEffect(() => {
    if (data && data.rawIssues) {
      console.log("Processing data for trends");
      
      // Group issues by date for trend data
      const issuesByDate = new Map();
      const statusMap = new Map();
      const priorityMap = new Map();
      
      // Process raw issues
      data.rawIssues.forEach((issue: any) => {
        // Format date (YYYY-MM-DD) for grouping
        const dateKey = new Date(issue.created_at).toISOString().split('T')[0];
        
        // Trend data - group by date
        if (!issuesByDate.has(dateKey)) {
          issuesByDate.set(dateKey, {
            date: dateKey,
            count: 0,
            responseTime: 0,
            resolutionTime: 0,
          });
        }
        const dateRecord = issuesByDate.get(dateKey);
        dateRecord.count += 1;
        
        // Calculate response time if comments exist
        if (issue.issue_comments && issue.issue_comments.length > 0) {
          const sortedComments = [...issue.issue_comments].sort(
            (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          
          const responseTimeDiff = new Date(sortedComments[0].created_at).getTime() - 
                                  new Date(issue.created_at).getTime();
          dateRecord.responseTime += responseTimeDiff / (1000 * 60 * 60); // Convert to hours
        }
        
        // Calculate resolution time for closed tickets
        if ((issue.status === 'closed' || issue.status === 'resolved') && issue.closed_at) {
          const resolutionTimeDiff = new Date(issue.closed_at).getTime() - 
                                    new Date(issue.created_at).getTime();
          dateRecord.resolutionTime += resolutionTimeDiff / (1000 * 60 * 60); // Convert to hours
        }
        
        // Status data
        const status = issue.status || 'unknown';
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
        
        // Priority data
        const priority = issue.priority || 'normal';
        priorityMap.set(priority, (priorityMap.get(priority) || 0) + 1);
      });
      
      // Convert maps to arrays for charts
      const trendArray = Array.from(issuesByDate.values()).map(item => ({
        ...item,
        responseTime: item.count > 0 ? item.responseTime / item.count : 0,
        resolutionTime: item.count > 0 ? item.resolutionTime / item.count : 0,
      }));
      
      const statusArray = Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));
      const priorityArray = Array.from(priorityMap.entries()).map(([name, value]) => ({ name, value }));
      
      // Sort trend data by date
      trendArray.sort((a, b) => a.date.localeCompare(b.date));
      
      setTrendData(trendArray);
      setStatusData(statusArray);
      setPriorityData(priorityArray);
      
      console.log("Processed trend data:", trendArray);
      console.log("Status distribution:", statusArray);
      console.log("Priority distribution:", priorityArray);
    }
  }, [data]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        <p>Error loading ticket trend data: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
  
  if (!data || !data.rawIssues || data.rawIssues.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No ticket trend data available for the selected filters. Please adjust your filters and try again.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Ticket Trend Analysis</h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="resolution-time">Resolution Time</TabsTrigger>
          <TabsTrigger value="status-distribution">Status Distribution</TabsTrigger>
          <TabsTrigger value="priority-distribution">Priority Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resolution-time">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Resolution Time Trend</CardTitle>
                <Button variant="outline" size="sm">Export CSV</Button>
              </div>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Tickets', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="resolutionTime" 
                    name="Avg. Resolution Time (hrs)" 
                    stroke="#1E40AF" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="count" 
                    name="Ticket Volume" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status-distribution">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Status Distribution</CardTitle>
                <Button variant="outline" size="sm">Export CSV</Button>
              </div>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="priority-distribution">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ticket Priority Distribution</CardTitle>
                <Button variant="outline" size="sm">Export CSV</Button>
              </div>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={priorityData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Tickets" fill="#8884d8">
                    {priorityData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
