
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface AuditLogsTableProps {
  auditLogs: any[];
  formatDate: (dateString: string) => string;
  isLoading: boolean;
}

const AuditLogsTable: React.FC<AuditLogsTableProps> = ({ 
  auditLogs, 
  formatDate,
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
      </div>
    );
  }

  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No audit logs available.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity Type</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Performed By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">{formatDate(log.performed_at || log.created_at)}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell>{log.entity_type}</TableCell>
              <TableCell className="max-w-xs truncate">
                {JSON.stringify(log.changes)}
              </TableCell>
              <TableCell>{log.performed_by || 'System'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AuditLogsTable;
