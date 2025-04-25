
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { getAnalytics } from "@/services/issueService";
import { getIssues } from "@/services/issueService";
import { getUsers } from "@/services/userService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, FileText, Users } from "lucide-react";
import { Issue, User } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const { authState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authState.isAuthenticated) {
      console.log("Not authenticated, redirecting to home");
      navigate("/");
      return;
    } 
    
    if (authState.role !== "admin") {
      console.log("Not an admin, redirecting to home");
      navigate("/");
      return;
    }

    console.log("Admin authenticated, loading dashboard data");
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching analytics data");
        // Make sure to await the async getAnalytics function
        const analyticsData = await getAnalytics();
        setAnalytics(analyticsData);
        
        console.log("Fetching issues data");
        const issues = await getIssues();
        const sortedIssues = [...issues].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentIssues(sortedIssues.slice(0, 5));
        
        console.log("Fetching users data");
        const users = await getUsers();
        setUserCount(users.filter(user => user.role === "employee").length);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
        console.log("Dashboard data loaded");
      }
    };

    fetchDashboardData();
  }, [authState, navigate]);

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
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yulu-blue"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalIssues || 0}</div>
                <p className="text-xs text-muted-foreground">Total issues raised</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
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
                <p className="text-xs text-muted-foreground">Average time to resolve issues</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Issues by Type</CardTitle>
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
                <CardTitle>Issues by City</CardTitle>
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
                      <Bar dataKey="value" name="Issues" fill="#1E40AF" />
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

          <Card>
            <CardHeader>
              <CardTitle>Recent Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {recentIssues.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left font-medium p-2">ID</th>
                        <th className="text-left font-medium p-2">Type</th>
                        <th className="text-left font-medium p-2">Status</th>
                        <th className="text-left font-medium p-2">Priority</th>
                        <th className="text-left font-medium p-2">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentIssues.map(issue => (
                        <tr key={issue.id} className="border-t">
                          <td className="p-2">{issue.id}</td>
                          <td className="p-2">{issue.typeId}</td>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No recent issues found
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
