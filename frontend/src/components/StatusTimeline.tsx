
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface TimelineEvent {
  id: string;
  status: string;
  timestamp: string;
  user: string;
  note?: string;
}

interface StatusTimelineProps {
  events: TimelineEvent[];
  currentStatus: string;
  title?: string;
}

const StatusTimeline: React.FC<StatusTimelineProps> = ({
  events,
  currentStatus,
  title = "Status Timeline"
}) => {
  const statusOrder = ['open', 'in_progress', 'resolved', 'closed'];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-500';
      case 'in_progress': return 'text-yellow-500';
      case 'resolved': return 'text-green-500';
      case 'closed': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const isStatusCompleted = (status: string) => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    const statusIndex = statusOrder.indexOf(status);
    return statusIndex <= currentIndex;
  };

  const getTimelineDuration = (startEvent: TimelineEvent, endEvent?: TimelineEvent) => {
    if (!endEvent) return null;
    
    const start = new Date(startEvent.timestamp);
    const end = new Date(endEvent.timestamp);
    const diffMs = end.getTime() - start.getTime();
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Circle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No status changes recorded yet</p>
            </div>
          ) : (
            events.map((event, index) => {
              const nextEvent = events[index + 1];
              const duration = getTimelineDuration(event, nextEvent);
              const isCompleted = isStatusCompleted(event.status);
              
              return (
                <div key={event.id} className="relative">
                  {/* Timeline line */}
                  {index < events.length - 1 && (
                    <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    {/* Status icon */}
                    <div className="flex-shrink-0 mt-1">
                      {isCompleted ? (
                        <CheckCircle className={`h-6 w-6 ${getStatusColor(event.status)}`} />
                      ) : (
                        <Circle className={`h-6 w-6 ${getStatusColor(event.status)}`} />
                      )}
                    </div>
                    
                    {/* Event details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="outline"
                          className={`${getStatusColor(event.status)} border-current`}
                        >
                          {getStatusLabel(event.status)}
                        </Badge>
                        {duration && (
                          <span className="text-xs text-gray-500">
                            Duration: {duration}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-1">
                        {formatDate(event.timestamp)}
                      </div>
                      
                      <div className="text-sm">
                        by <span className="font-medium">{event.user}</span>
                      </div>
                      
                      {event.note && (
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {event.note}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusTimeline;
