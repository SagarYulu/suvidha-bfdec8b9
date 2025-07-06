
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock } from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  createdAt: string;
  employeeName: string;
}

interface RecentTicketsTableProps {
  tickets: Ticket[];
  onViewTicket: (ticketId: string) => void;
}

const RecentTicketsTable: React.FC<RecentTicketsTableProps> = ({
  tickets,
  onViewTicket
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Tickets
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Clock className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p>No recent tickets</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">ID</th>
                  <th className="text-left py-2">Employee</th>
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Priority</th>
                  <th className="text-left py-2">Assignee</th>
                  <th className="text-left py-2">Created</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 text-sm font-mono">
                      #{ticket.id.slice(-6)}
                    </td>
                    <td className="py-3 text-sm">
                      {ticket.employeeName}
                    </td>
                    <td className="py-3 text-sm">
                      {ticket.title}
                    </td>
                    <td className="py-3">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm">
                      {ticket.assignee || 'Unassigned'}
                    </td>
                    <td className="py-3 text-sm">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewTicket(ticket.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTicketsTable;
