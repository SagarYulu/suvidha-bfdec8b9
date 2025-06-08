
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  avgResolutionTime: number;
}

const MobileDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/analytics/mobile-dashboard');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/mobile/create-issue">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Issue
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
            Quick Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.totalIssues || 0}</div>
              <div className="text-sm text-gray-600">Total Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.resolvedIssues || 0}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-orange-600">{stats?.openIssues || 0}</div>
                <div className="text-sm text-gray-600">Open</div>
              </div>
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-blue-600">{stats?.inProgressIssues || 0}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <AlertCircle className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">Issue #1234 resolved</span>
              </div>
              <Badge variant="secondary" className="text-xs">2h ago</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-sm">New comment on #1233</span>
              </div>
              <Badge variant="secondary" className="text-xs">4h ago</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <Link to="/mobile/issues">
          <Card className="cursor-pointer hover:bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">My Issues</span>
                <Badge>{stats?.totalIssues || 0}</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/mobile/profile">
          <Card className="cursor-pointer hover:bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Profile</span>
                <span className="text-gray-400">→</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default MobileDashboard;
