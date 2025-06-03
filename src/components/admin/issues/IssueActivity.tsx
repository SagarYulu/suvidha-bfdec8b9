
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuditTrail } from '@/services/issues/issueAuditService';

interface IssueActivityProps {
  issueId: string;
}

const IssueActivity: React.FC<IssueActivityProps> = ({ issueId }) => {
  const [auditTrail, setAuditTrail] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAuditTrail = async () => {
      try {
        const trail = await getAuditTrail(issueId);
        setAuditTrail(trail);
      } catch (error) {
        console.error('Error fetching audit trail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditTrail();
  }, [issueId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading activity...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {auditTrail.length === 0 ? (
          <p className="text-muted-foreground">No activity found</p>
        ) : (
          <div className="space-y-4">
            {auditTrail.map((entry) => (
              <div key={entry.id} className="border-l-2 border-gray-200 pl-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{entry.action}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
                {entry.details && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {JSON.stringify(entry.details)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IssueActivity;
