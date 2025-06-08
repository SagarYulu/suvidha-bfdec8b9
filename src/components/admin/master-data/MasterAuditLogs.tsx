
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Database } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '@/services/masterDataService';

const MasterAuditLogs = () => {
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['master-audit-logs', entityFilter, actionFilter],
    queryFn: () => getAuditLogs(
      entityFilter === 'all' ? undefined : entityFilter as 'role' | 'city' | 'cluster',
      undefined,
      100
    )
  });

  const filteredLogs = auditLogs.filter(log => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    return true;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'role': return <User className="w-4 h-4" />;
      case 'city': case 'cluster': return <Database className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const formatChanges = (changes: any) => {
    if (typeof changes === 'object' && changes !== null) {
      return JSON.stringify(changes, null, 2);
    }
    return String(changes);
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading audit logs...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-4 items-center">
        <div>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="role">Roles</SelectItem>
              <SelectItem value="city">Cities</SelectItem>
              <SelectItem value="cluster">Clusters</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <Card key={log.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                    {getEntityIcon(log.entityType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={getActionColor(log.action)}>
                        {log.action.toUpperCase()}
                      </Badge>
                      <span className="font-medium capitalize">{log.entityType}</span>
                      <span className="text-gray-500">#{log.entityId.slice(0, 8)}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{log.userName || 'System'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    {log.changes && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                          View Changes
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-32">
                          {formatChanges(log.changes)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No audit logs found matching the current filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterAuditLogs;
