
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, User, Clock, MessageSquare, Edit } from 'lucide-react';
import { ApiClient } from '@/services/apiClient';

interface ActivityItem {
  id: string;
  type: 'status_change' | 'assignment' | 'comment' | 'update' | 'creation';
  description: string;
  timestamp: string;
  user: {
    name: string;
    role: string;
  };
  details?: Record<string, any>;
}

interface IssueActivityProps {
  issueId: string;
  activities?: ActivityItem[];
  isLoading?: boolean;
}

const IssueActivity: React.FC<IssueActivityProps> = ({
  issueId,
  activities: propActivities,
  isLoading = false
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>(propActivities || []);
  const [loading, setLoading] = useState(isLoading);

  useEffect(() => {
    if (!propActivities && issueId) {
      fetchActivities();
    }
  }, [issueId, propActivities]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await ApiClient.get(`/api/issues/${issueId}/activities`);
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'assignment':
        return <User className="h-4 w-4 text-green-600" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case 'update':
        return <Edit className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'status_change':
        return 'bg-blue-50 border-blue-200';
      case 'assignment':
        return 'bg-green-50 border-green-200';
      case 'comment':
        return 'bg-purple-50 border-purple-200';
      case 'update':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No activity recorded yet</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div key={activity.id} className="relative">
                {index < activities.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
                )}
                
                <div className={`flex gap-4 p-4 rounded-lg border ${getActivityColor(activity.type)}`}>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {activity.user.role}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600">
                      by {activity.user.name}
                    </p>
                    
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                        {Object.entries(activity.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace('_', ' ')}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IssueActivity;
