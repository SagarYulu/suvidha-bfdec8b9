
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User,
  Calendar,
  MessageSquare,
  ArrowUpCircle
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'status_change' | 'assignment' | 'comment' | 'escalation' | 'creation';
  title: string;
  description: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
  metadata?: {
    oldValue?: string;
    newValue?: string;
    [key: string]: any;
  };
}

interface StatusTimelineProps {
  events: TimelineEvent[];
  currentStatus: string;
  className?: string;
}

const StatusTimeline: React.FC<StatusTimelineProps> = ({ 
  events, 
  currentStatus, 
  className = '' 
}) => {
  const getEventIcon = (type: string, metadata?: any) => {
    switch (type) {
      case 'creation':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'status_change':
        return <Clock className="h-5 w-5 text-green-500" />;
      case 'assignment':
        return <User className="h-5 w-5 text-purple-500" />;
      case 'comment':
        return <MessageSquare className="h-5 w-5 text-gray-500" />;
      case 'escalation':
        return <ArrowUpCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'creation':
        return 'border-blue-500';
      case 'status_change':
        return 'border-green-500';
      case 'assignment':
        return 'border-purple-500';
      case 'comment':
        return 'border-gray-300';
      case 'escalation':
        return 'border-red-500';
      default:
        return 'border-gray-300';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'secondary';
      case 'in_progress':
        return 'default';
      case 'resolved':
        return 'outline';
      case 'closed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status Timeline
          </span>
          <Badge variant={getStatusBadgeVariant(currentStatus)}>
            {currentStatus.replace('_', ' ').toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
          
          {/* Timeline Events */}
          <div className="space-y-6">
            {sortedEvents.map((event, index) => {
              const { date, time } = formatTimestamp(event.timestamp);
              
              return (
                <div key={event.id} className="relative flex items-start space-x-4">
                  {/* Event Icon */}
                  <div className={`
                    relative z-10 flex items-center justify-center w-12 h-12 
                    bg-white border-2 rounded-full ${getEventColor(event.type)}
                  `}>
                    {getEventIcon(event.type, event.metadata)}
                  </div>
                  
                  {/* Event Content */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      {/* Event Header */}
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {event.title}
                        </h4>
                        <div className="text-xs text-gray-500 text-right">
                          <div>{date}</div>
                          <div>{time}</div>
                        </div>
                      </div>
                      
                      {/* Event Description */}
                      <p className="text-sm text-gray-700 mb-2">
                        {event.description}
                      </p>
                      
                      {/* Status Change Details */}
                      {event.type === 'status_change' && event.metadata && (
                        <div className="flex items-center space-x-2 text-xs">
                          <Badge variant="outline" className="text-red-600">
                            {event.metadata.oldValue}
                          </Badge>
                          <span>→</span>
                          <Badge variant="outline" className="text-green-600">
                            {event.metadata.newValue}
                          </Badge>
                        </div>
                      )}
                      
                      {/* User Info */}
                      <div className="flex items-center mt-3 pt-2 border-t border-gray-200">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-xs text-gray-600">
                          {event.user.name}
                        </span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {event.user.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Empty State */}
          {sortedEvents.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No timeline events available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusTimeline;
