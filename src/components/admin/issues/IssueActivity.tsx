
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getAuditTrail } from "@/services/issues/issueAuditService";
import { Issue } from "@/types";
import { getEmployeeNameByUuid } from "@/services/issues/issueUtils";
import { Activity, Clock, AlertCircle, UserPlus, MessageSquare, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface IssueActivityProps {
  issue: Issue;
}

const IssueActivity = ({ issue }: IssueActivityProps) => {
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [employeeNames, setEmployeeNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchActivityLogs = async () => {
      setIsLoading(true);
      try {
        const logs = await getAuditTrail(issue.id, 20);
        setActivityLogs(logs);
        
        // Gather all unique employee UUIDs
        const uniqueEmployeeIds = Array.from(
          new Set(logs.map(log => log.employee_uuid))
        );
        
        // Get employee names
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
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'ticket_assigned':
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
  
  // Helper to get activity label
  const getActivityLabel = (log: any) => {
    const actorName = employeeNames[log.employee_uuid] || "Unknown user";
    
    switch (log.action) {
      case 'ticket_status_changed':
        return `${actorName} changed status from ${log.previous_status || 'unknown'} to ${log.new_status}`;
      case 'ticket_assigned':
        const assigneeName = log.details?.assigneeName || "an agent";
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
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'ticket_assigned':
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
                  {log.action.replace(/_/g, ' ')}
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
