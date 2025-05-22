
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getAuditTrail } from "@/services/issues/issueAuditService";
import { Issue } from "@/types";
import { getEmployeeNameByUuid } from "@/services/issues/issueUtils";
import { Activity, Clock, AlertCircle, UserPlus, MessageSquare, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Json } from "@/integrations/supabase/types";

interface IssueActivityProps {
  issue: Issue;
}

interface PerformerInfo {
  name: string;
  role?: string;
  id: string;
}

// Helper function to safely access performer data from Json type
const getPerformerFromJson = (details: Json | null): PerformerInfo | null => {
  if (!details || typeof details !== 'object' || Array.isArray(details)) {
    return null;
  }

  const detailsObj = details as Record<string, Json>;
  const performer = detailsObj.performer;
  
  if (!performer || typeof performer !== 'object' || Array.isArray(performer)) {
    return null;
  }
  
  const performerObj = performer as Record<string, Json>;
  
  if (typeof performerObj.name !== 'string' || !performerObj.name) {
    return null;
  }
  
  return {
    name: performerObj.name,
    role: typeof performerObj.role === 'string' ? performerObj.role : undefined,
    id: typeof performerObj.id === 'string' ? performerObj.id : 'unknown'
  };
};

const IssueActivity = ({ issue }: IssueActivityProps) => {
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [employeeNames, setEmployeeNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchActivityLogs = async () => {
      setIsLoading(true);
      try {
        const logs = await getAuditTrail(issue.id, 20);
        
        // Filter out duplicate logs - prioritize logs with performer info
        const uniqueLogsByAction = new Map();
        
        // First, sort logs to prioritize ones with performer info
        const sortedLogs = [...logs].sort((a, b) => {
          const aHasPerformer = getPerformerFromJson(a.details) !== null;
          const bHasPerformer = getPerformerFromJson(b.details) !== null;
          
          if (aHasPerformer && !bHasPerformer) return -1;
          if (!aHasPerformer && bHasPerformer) return 1;
          
          // If both have or don't have performer info, sort by created_at (newer first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        // Keep only the first (highest priority) log for each action+time combination
        sortedLogs.forEach(log => {
          // Create a key that identifies the action and approximate time (within 1 second)
          const timestamp = new Date(log.created_at).getTime();
          const roundedTime = Math.floor(timestamp / 1000) * 1000; // Round to nearest second
          const key = `${log.action}_${roundedTime}_${log.employee_uuid}`;
          
          if (!uniqueLogsByAction.has(key)) {
            uniqueLogsByAction.set(key, log);
          }
        });
        
        const dedupedLogs = Array.from(uniqueLogsByAction.values());
        
        // Sort logs by created_at (newest first)
        dedupedLogs.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setActivityLogs(dedupedLogs);
        
        // Gather all unique employee UUIDs that don't have performer info
        const employeeIdsNeedingNames = dedupedLogs
          .filter(log => {
            const performer = getPerformerFromJson(log.details);
            return !performer && log.employee_uuid;
          })
          .map(log => log.employee_uuid);

        const uniqueEmployeeIds = Array.from(new Set(employeeIdsNeedingNames));
        
        // Get employee names for those without performer info
        const names: Record<string, string> = {};
        for (const employeeId of uniqueEmployeeIds) {
          const name = await getEmployeeNameByUuid(employeeId);
          names[employeeId] = name || "Unknown";
        }
        
        setEmployeeNames(names);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (issue?.id) {
      fetchActivityLogs();
    }
  }, [issue?.id]);
  
  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Helper to get activity icon
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'ticket_status_changed':
      case 'status_change':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'ticket_assigned':
      case 'assignment':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'comment_added':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'internal_comment_added':
        return <Lock className="h-4 w-4 text-orange-500" />;
      case 'ticket_reopened':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Helper to get performer name from the log
  const getPerformerName = (log: any): string => {
    // Prioritize performer info from details
    const performer = getPerformerFromJson(log.details);
    if (performer && performer.name) {
      return performer.name;
    }
    
    // Fall back to our fetched names
    if (employeeNames[log.employee_uuid]) {
      return employeeNames[log.employee_uuid];
    }
    
    // Last resort
    return log.performer_name || "Unknown User";
  };
  
  // Helper to properly parse status values
  const getStatusValue = (log: any, statusField: string): string => {
    // Try to get status from details first
    if (log.details && typeof log.details === 'object') {
      const detailsObj = log.details as Record<string, any>;
      if (detailsObj[statusField] && typeof detailsObj[statusField] === 'string') {
        return detailsObj[statusField];
      }
    }
    
    // Fall back to direct field
    return log[statusField] || "unknown";
  };
  
  // Helper to get activity label
  const getActivityLabel = (log: any) => {
    const actorName = getPerformerName(log);
    
    switch (log.action) {
      case 'ticket_status_changed':
      case 'status_change': {
        // Get status values with improved handling
        const previousStatus = getStatusValue(log, 'previous_status') || log.previous_status;
        const newStatus = getStatusValue(log, 'newStatus') || log.new_status;
        
        return `${actorName} changed status from ${previousStatus || 'unknown'} to ${newStatus}`;
      }
      case 'ticket_assigned':
      case 'assignment':
        // Safely get assignee name from details
        let assigneeName = "an agent";
        
        if (log.details && typeof log.details === 'object' && !Array.isArray(log.details)) {
          const detailsObj = log.details as Record<string, Json>;
          assigneeName = typeof detailsObj.assigneeName === 'string' 
            ? detailsObj.assigneeName 
            : assigneeName;
        }
        
        return `${actorName} assigned ticket to ${assigneeName}`;
      case 'comment_added':
        return `${actorName} added a comment`;
      case 'internal_comment_added':
        return `${actorName} added an internal note`;
      case 'ticket_reopened':
        return `${actorName} reopened the ticket`;
      default:
        return `${actorName} performed action: ${log.action}`;
    }
  };
  
  // Helper to get activity badge
  const getActivityBadge = (action: string) => {
    switch (action) {
      case 'ticket_status_changed':
      case 'status_change':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'ticket_assigned':
      case 'assignment':
        return "bg-green-100 text-green-800 border-green-200";
      case 'comment_added':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'internal_comment_added':
        return "bg-orange-100 text-orange-800 border-orange-200";
      case 'ticket_reopened':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  // Helper to get simple action type for badge display
  const getSimpleActionType = (action: string): string => {
    if (action.includes('status')) return 'status change';
    if (action.includes('assign')) return 'assignment';
    if (action.includes('internal_comment')) return 'internal comment added';
    if (action.includes('comment')) return 'comment added';
    if (action.includes('reopen')) return 'ticket reopened';
    return action.replace(/_/g, ' ');
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <Activity className="h-4 w-4 mr-2" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activityLogs.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm italic text-center">
            No activity recorded yet
          </div>
        ) : (
          <div className="p-1 space-y-0.5 max-h-[350px] overflow-y-auto">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex gap-2 items-start p-2 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100">
                <div className="mt-1">{getActivityIcon(log.action)}</div>
                <div className="flex-1 text-sm">
                  <div>{getActivityLabel(log)}</div>
                  <div className="text-xs text-gray-500">{formatDate(log.created_at)}</div>
                </div>
                <Badge 
                  variant="outline"
                  className={`text-xs ${getActivityBadge(log.action)}`}
                >
                  {getSimpleActionType(log.action)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IssueActivity;
