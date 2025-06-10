
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, User, Activity } from "lucide-react";
import { apiService } from "@/services/api";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface AuditEntry {
  id: string;
  action: string;
  performer_name: string;
  performer_email?: string;
  previous_status?: string;
  new_status?: string;
  details: any;
  created_at: string;
}

interface AuditTrailProps {
  issueId?: string;
  limit?: number;
  title?: string;
}

const AuditTrail: React.FC<AuditTrailProps> = ({ 
  issueId, 
  limit = 50, 
  title = "Activity History" 
}) => {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    fetchAuditTrail();
  }, [issueId, limit]);

  const fetchAuditTrail = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAuditTrail(issueId, limit);
      setAuditEntries(response.auditTrail || []);
    } catch (error) {
      handleError(error, 'Fetching audit trail');
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
      case 'issue_created':
        return 'bg-green-100 text-green-800';
      case 'updated':
      case 'status_changed':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
      case 'issue_assigned':
        return 'bg-purple-100 text-purple-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {auditEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity history available
            </div>
          ) : (
            <div className="space-y-4">
              {auditEntries.map((entry) => (
                <div key={entry.id} className="border-l-4 border-blue-200 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getActionColor(entry.action)}>
                        {entry.action.replace('_', ' ')}
                      </Badge>
                      {entry.previous_status && entry.new_status && (
                        <span className="text-sm text-muted-foreground">
                          {entry.previous_status} → {entry.new_status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(entry.created_at)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{entry.performer_name}</span>
                    {entry.performer_email && (
                      <span className="text-muted-foreground">({entry.performer_email})</span>
                    )}
                  </div>
                  
                  {entry.details && Object.keys(entry.details).length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(entry.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AuditTrail;
