
import React from 'react';
import { Issue, IssueComment } from "@/types";
import { formatDistanceToNow } from 'date-fns';

interface IssueTimelineProps {
  issue: Issue;
  auditTrail?: Array<{
    id: string;
    action: string;
    employeeUuid: string;
    createdAt: string;
    previousStatus?: string;
    newStatus?: string;
  }>;
  commenterNames: Record<string, string>;
}

const IssueTimeline: React.FC<IssueTimelineProps> = ({ 
  issue, 
  auditTrail = [],
  commenterNames 
}) => {
  // Define event types for better type checking
  type TimelineEventBase = {
    id: string;
    timestamp: string;
    employeeUuid: string;
    content: string;
  };
  
  type StatusEvent = TimelineEventBase & {
    type: 'status';
    previousStatus?: string;
    newStatus?: string;
  };
  
  type CommentEvent = TimelineEventBase & {
    type: 'comment';
    isPrivate: boolean;
  };
  
  type CreationEvent = TimelineEventBase & {
    type: 'creation';
  };
  
  type AssignmentEvent = TimelineEventBase & {
    type: 'assignment';
  };
  
  type TimelineEvent = StatusEvent | CommentEvent | CreationEvent | AssignmentEvent;

  // Combine comments and status changes for timeline
  const timelineEvents: TimelineEvent[] = [
    // Creation event
    {
      id: 'creation',
      type: 'creation',
      timestamp: issue.createdAt,
      employeeUuid: issue.employeeUuid,
      content: 'Ticket created'
    },
    // Assignment event if assigned
    ...(issue.assignedTo ? [{
      id: 'assignment',
      type: 'assignment',
      timestamp: issue.createdAt, // We don't have assignment time, using creation time
      employeeUuid: issue.assignedTo,
      content: 'Ticket assigned'
    }] : []),
    // Status change events
    ...auditTrail
      .filter(event => event.action === 'status_changed')
      .map(event => ({
        id: event.id,
        type: 'status' as const,
        timestamp: event.createdAt,
        employeeUuid: event.employeeUuid,
        content: `Status changed from ${event.previousStatus} to ${event.newStatus}`,
        previousStatus: event.previousStatus,
        newStatus: event.newStatus
      })),
    // Comment events
    ...issue.comments.map(comment => ({
      id: comment.id,
      type: 'comment' as const,
      timestamp: comment.createdAt,
      employeeUuid: comment.employeeUuid,
      content: comment.content,
      isPrivate: false // Regular comments are not private
    }))
  ];

  // Sort events by timestamp (newest first)
  const sortedEvents = [...timelineEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto">
      <h3 className="font-semibold text-base">Ticket Timeline</h3>
      
      {sortedEvents.length > 0 ? (
        <div className="space-y-3">
          {sortedEvents.map(event => {
            const name = commenterNames[event.employeeUuid] || 'Unknown User';
            const timeAgo = formatDistanceToNow(new Date(event.timestamp), { addSuffix: true });
            
            return (
              <div key={event.id} className="border-l-2 border-gray-200 pl-3">
                <div className="flex items-center">
                  <span className="font-medium text-sm">{name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {timeAgo}
                  </span>
                </div>
                
                {event.type === 'status' && (
                  <div className="mt-1 text-sm">
                    {`Changed status from `}
                    <span className={`font-medium`}>
                      {event.previousStatus?.replace('_', ' ')}
                    </span>
                    {` to `}
                    <span className={`font-medium`}>
                      {event.newStatus?.replace('_', ' ')}
                    </span>
                  </div>
                )}
                
                {event.type === 'creation' && (
                  <div className="mt-1 text-sm">
                    Created this ticket
                  </div>
                )}
                
                {event.type === 'assignment' && (
                  <div className="mt-1 text-sm">
                    Assigned to resolver
                  </div>
                )}
                
                {event.type === 'comment' && (
                  <div className="mt-1 text-sm bg-gray-50 p-2 rounded">
                    {event.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No timeline events</p>
      )}
    </div>
  );
};

export default IssueTimeline;
