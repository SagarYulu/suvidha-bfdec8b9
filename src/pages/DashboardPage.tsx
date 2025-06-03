
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { authState } = useAuth();

  const quickActions = [
    {
      title: 'Feedback Analytics',
      description: 'View comprehensive feedback analytics and insights',
      icon: BarChart3,
      href: '/admin/feedback-analytics',
      color: 'bg-blue-500'
    },
    {
      title: 'Sentiment Analysis',
      description: 'Analyze employee sentiment and mood trends',
      icon: MessageSquare,
      href: '/sentiment',
      color: 'bg-green-500'
    },
    {
      title: 'Mobile Sentiment',
      description: 'Mobile-optimized sentiment submission',
      icon: Activity,
      href: '/mobile/sentiment',
      color: 'bg-purple-500'
    }
  ];

  const stats = [
    {
      title: 'Total Feedback',
      value: '1,234',
      change: '+12%',
      icon: MessageSquare,
      color: 'text-blue-600'
    },
    {
      title: 'Response Rate',
      value: '78%',
      change: '+5%',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Active Users',
      value: '892',
      change: '+3%',
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {authState.user?.email || 'User'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={index} to={action.href}>
                    <div className="group p-6 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center mb-4">
                        <div className={`p-2 rounded-lg ${action.color} text-white mr-4`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{action.description}</p>
                      <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                        <span className="text-sm font-medium">Get Started</span>
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
