
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, MessageSquare, Settings } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'status_change' | 'comment' | 'assignment' | 'priority_change';
  description: string;
  user: string;
  timestamp: string;
  details?: any;
}

interface IssueActivityProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

const IssueActivity: React.FC<IssueActivityProps> = ({
  activities,
  isLoading = false
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <Settings className="h-4 w-4" />;
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'assignment': return <User className="h-4 w-4" />;
      case 'priority_change': return <Settings className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'status_change': return 'bg-blue-100 text-blue-800';
      case 'comment': return 'bg-green-100 text-green-800';
      case 'assignment': return 'bg-purple-100 text-purple-800';
      case 'priority_change': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
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
          <Clock className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Clock className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p>No activity recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 pb-4 border-b last:border-b-0">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">by {activity.user}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IssueActivity;
