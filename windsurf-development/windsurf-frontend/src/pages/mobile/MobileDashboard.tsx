
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
}

export const MobileDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalIssues: 0,
    openIssues: 0,
    resolvedIssues: 0,
    pendingIssues: 0
  });
  const [recentIssues, setRecentIssues] = useState([]);

  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulated API call - replace with actual API
      setStats({
        totalIssues: 45,
        openIssues: 12,
        resolvedIssues: 28,
        pendingIssues: 5
      });
      
      setRecentIssues([
        { id: '1', title: 'Salary Query', status: 'open', priority: 'medium', created_at: '2024-01-15' },
        { id: '2', title: 'Leave Application', status: 'pending', priority: 'low', created_at: '2024-01-14' },
        { id: '3', title: 'Performance Review', status: 'resolved', priority: 'high', created_at: '2024-01-13' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your issue overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalIssues}</div>
              <div className="text-sm text-gray-500">Total Issues</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.openIssues}</div>
              <div className="text-sm text-gray-500">Open</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.resolvedIssues}</div>
              <div className="text-sm text-gray-500">Resolved</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingIssues}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => navigate('/mobile/issues/new')}
            className="h-12 flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Issue
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/mobile/issues')}
            className="h-12 flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" />
            View All
          </Button>
        </div>
      </div>

      {/* Recent Issues */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Issues</h2>
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {recentIssues.map((issue: any) => (
            <Card key={issue.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate">{issue.title}</h3>
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Badge className={getPriorityColor(issue.priority)}>
                    {issue.priority}
                  </Badge>
                  <span className="text-gray-500">{issue.created_at}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Navigation Spacer */}
      <div className="h-20"></div>
    </div>
  );
};

export default MobileDashboard;
