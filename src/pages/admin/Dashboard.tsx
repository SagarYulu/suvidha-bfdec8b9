import { useCallback, useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getAnalytics, getIssues, IssueFilters } from "@/services/issueService";
import { getUsers } from "@/services/userService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, TicketCheck, Users } from "lucide-react";
import { Issue } from "@/types";
import FilterBar from "@/components/dashboard/FilterBar";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [filters, setFilters] = useState<IssueFilters>({
    city: null,
    cluster: null,
    issueType: null
  });
  
  // Memoize the filter change handler to prevent unnecessary re-renders
  const handleFilterChange = useCallback((newFilters: IssueFilters) => {
    setFilters(newFilters);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch analytics and issues data in parallel to speed up loading
        const [analyticsData, issues, users] = await Promise.all([
          getAnalytics(filters),
          getIssues(filters),
          getUsers()
        ]);
        
        setAnalytics(analyticsData);
        
        const sortedIssues = [...issues].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentIssues(sortedIssues.slice(0, 5));
        
        setUserCount(users.filter(user => user.role === "employee").length);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [filters]);

  // Constants for chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'];

  // Add null checks before using Object.entries
  const typePieData = analytics && analytics.typeCounts ? 
    Object.entries(analytics.typeCounts).map(([name, value]: [string, any]) => ({
      name,
      value
    })) : [];

  const cityBarData = analytics && analytics.cityCounts ? 
    Object.entries(analytics.cityCounts).map(([name, value]: [string, any]) => ({
      name,
      value
    })) : [];

  const statusData = [
    { name: 'Open', value: analytics?.openIssues || 0, color: '#FF8042' },
    { name: 'Resolved', value: analytics?.resolvedIssues || 0, color: '#00C49F' },
  ];

  return (
    <AdminLayout title="Dashboard">
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yulu-blue"></div>
          <span className="ml-3 text-lg text-gray-600">Loading dashboard data...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Add FilterBar component */}
          <FilterBar onFilterChange={handleFilterChange} />
          
          {/* Dashboard Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                <TicketCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalIssues || 0}</div>
                <p className="text-xs text-muted-foreground">Total tickets raised</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved Tickets</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.resolvedIssues || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics ? (analytics.resolutionRate.toFixed(1) + '% resolution rate') : '0% resolution rate'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Resolution Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.avgResolutionTime || '0'} hrs</div>
                <p className="text-xs text-muted-foreground">Average time to resolve tickets</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userCount}</div>
                <p className="text-xs text-muted-foreground">Total employees registered</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tickets by Type</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {typePieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typePieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {typePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tickets by City</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {cityBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={cityBarData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Tickets" fill="#1E40AF" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Tickets Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {recentIssues.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left font-medium p-2">ID</th>
                        <th className="text-left font-medium p-2">Employee</th>
                        <th className="text-left font-medium p-2">Ticket Type</th>
                        <th className="text-left font-medium p-2">Description</th>
                        <th className="text-left font-medium p-2">Status</th>
                        <th className="text-left font-medium p-2">Priority</th>
                        <th className="text-left font-medium p-2">Created</th>
                        <th className="text-left font-medium p-2">Updated</th>
                        <th className="text-left font-medium p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentIssues.map((issue) => (
                        <tr key={issue.id} className="border-t">
                          <td className="p-2">{issue.id}</td>
                          <td className="p-2"></td>
                          <td className="p-2">
                            <div>
                              <div></div>
                              <div className="text-xs text-gray-500">
                                
                              </div>
                            </div>
                          </td>
                          <td className="p-2 max-w-xs truncate">
                            {issue.description}
                          </td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              issue.status === "open" ? "bg-red-100 text-red-800" :
                              issue.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                              "bg-green-100 text-green-800"
                            }`}>
                              {issue.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              issue.priority === "high" ? "bg-red-100 text-red-800" :
                              issue.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                              "bg-green-100 text-green-800"
                            }`}>
                              {issue.priority}
                            </span>
                          </td>
                          <td className="p-2">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-2">
                            {new Date(issue.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="p-2">
                            
                          </td>
                        </tr>
                      ))}
                      
                      {recentIssues.length === 0 && (
                        <tr>
                          <td colSpan={9} className="text-center py-6">
                            No tickets found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No recent tickets found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
