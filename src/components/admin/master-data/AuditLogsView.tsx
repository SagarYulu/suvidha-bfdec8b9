
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getAuditLogs } from '@/services/masterDataService';

export const AuditLogsView: React.FC = () => {
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['auditLogs', entityTypeFilter],
    queryFn: () => getAuditLogs(
      entityTypeFilter === 'all' ? undefined : entityTypeFilter as 'role' | 'city' | 'cluster'
    ),
  });

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'create': return 'default';
      case 'update': return 'secondary';
      case 'delete': return 'destructive';
      default: return 'outline';
    }
  };

  const getEntityTypeBadgeVariant = (entityType: string) => {
    switch (entityType) {
      case 'role': return 'default';
      case 'city': return 'secondary';
      case 'cluster': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <div>Loading audit logs...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Audit Logs ({auditLogs?.length || 0})</h3>
        <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by entity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entity Types</SelectItem>
            <SelectItem value="role">Roles</SelectItem>
            <SelectItem value="city">Cities</SelectItem>
            <SelectItem value="cluster">Clusters</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entity Type</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Changes</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditLogs?.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <Badge variant={getEntityTypeBadgeVariant(log.entityType)}>
                  {log.entityType}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getActionBadgeVariant(log.action)}>
                  {log.action}
                </Badge>
              </TableCell>
              <TableCell>{log.userName || 'Unknown User'}</TableCell>
              <TableCell>
                <Card className="max-w-md">
                  <CardContent className="p-2">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(log.changes, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </TableCell>
              <TableCell>
                {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
