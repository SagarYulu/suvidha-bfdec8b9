
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, MessageSquare, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'status_change' | 'comment' | 'assignment' | 'escalation' | 'priority_change';
  description: string;
  user: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface IssueActivityProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

const IssueActivity: React.FC<IssueActivityProps> = ({ activities, isLoading = false }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'assignment':
        return <User className="h-4 w-4 text-purple-600" />;
      case 'escalation':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'priority_change':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'status_change':
        return 'bg-green-50 border-green-200';
      case 'comment':
        return 'bg-blue-50 border-blue-200';
      case 'assignment':
        return 'bg-purple-50 border-purple-200';
      case 'escalation':
        return 'bg-red-50 border-red-200';
      case 'priority_change':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Issue Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
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
          Issue Activity ({activities.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No activity recorded yet.
              </div>
            ) : (
              activities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className={`p-3 border rounded-lg ${getActivityColor(activity.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <Badge variant="outline" className="text-xs">
                          {activity.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>by {activity.user}</span>
                        <span>{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}</span>
                      </div>
                      {activity.metadata && (
                        <div className="text-xs text-gray-600 bg-white/50 p-2 rounded">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <div key={key}>
                              <strong>{key}:</strong> {String(value)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {index < activities.length - 1 && (
                    <div className="ml-2 mt-2 border-l-2 border-gray-200 h-4"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default IssueActivity;
