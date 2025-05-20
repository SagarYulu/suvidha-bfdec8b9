
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
    details?: any;
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
    actor?: string;
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
    assigneeName?: string;
  };
  
  type TimelineEvent = StatusEvent | CommentEvent | CreationEvent | AssignmentEvent;

  // Get creator name for the issue
  const creatorName = commenterNames[issue.employeeUuid] || 'Unknown User';
  
  // Combine comments and status changes for timeline
  const timelineEvents: TimelineEvent[] = [
    // Creation event
    {
      id: 'creation',
      type: 'creation' as const,
      timestamp: issue.createdAt,
      employeeUuid: issue.employeeUuid,
      content: `${creatorName} created this ticket`,
      actor: creatorName
    },
    
    // Extract assignment events from audit trail
    ...auditTrail
      .filter(event => event.action === 'assignment')
      .map(event => {
        // Get assignee name from audit log details or from commenters list
        const assigneeId = event.details?.assigneeId || '';
        const assigneeName = event.details?.assigneeName || commenterNames[assigneeId] || 'Unknown User';
        
        return {
          id: event.id,
          type: 'assignment' as const,
          timestamp: event.createdAt,
          employeeUuid: event.employeeUuid,
          content: `Ticket assigned to ${assigneeName}`,
          actor: commenterNames[event.employeeUuid] || 'Unknown User',
          assigneeName
        };
      }),
      
    // Status change events
    ...auditTrail
      .filter(event => event.action === 'status_change')
      .map(event => {
        const actorName = commenterNames[event.employeeUuid] || 'Unknown User';
        
        return {
          id: event.id,
          type: 'status' as const,
          timestamp: event.createdAt,
          employeeUuid: event.employeeUuid,
          content: `${actorName} changed status from ${event.previousStatus?.replace('_', ' ')} to ${event.newStatus?.replace('_', ' ')}`,
          actor: actorName,
          previousStatus: event.previousStatus,
          newStatus: event.newStatus
        };
      }),
      
    // Comment events
    ...issue.comments.map(comment => {
      const commenterName = commenterNames[comment.employeeUuid] || 'Unknown User';
      
      return {
        id: comment.id,
        type: 'comment' as const,
        timestamp: comment.createdAt,
        employeeUuid: comment.employeeUuid,
        content: comment.content,
        actor: commenterName,
        isPrivate: false
      };
    })
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
            const name = event.actor || commenterNames[event.employeeUuid] || 'Unknown User';
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
                    Changed status from 
                    <span className="font-medium mx-1">
                      {event.previousStatus?.replace('_', ' ')}
                    </span>
                    to
                    <span className="font-medium mx-1">
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
                    Assigned ticket to 
                    <span className="font-medium ml-1">
                      {event.assigneeName || 'resolver'}
                    </span>
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
