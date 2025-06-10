
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketIcon, Eye } from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: string;
  createdAt: string;
  category: string;
}

const RecentTicketsTable: React.FC = () => {
  // Mock data - in real app this would come from props or API
  const recentTickets: Ticket[] = [
    {
      id: 'TKT-001',
      title: 'Login Issues',
      status: 'open',
      priority: 'high',
      createdBy: 'John Doe',
      createdAt: '2024-01-15',
      category: 'Technical'
    },
    {
      id: 'TKT-002',
      title: 'Payment Problem',
      status: 'in_progress',
      priority: 'urgent',
      createdBy: 'Jane Smith',
      createdAt: '2024-01-14',
      category: 'Financial'
    },
    {
      id: 'TKT-003',
      title: 'Feature Request',
      status: 'resolved',
      priority: 'medium',
      createdBy: 'Mike Johnson',
      createdAt: '2024-01-13',
      category: 'Enhancement'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusColors = {
      open: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.open;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
      urgent: 'bg-purple-100 text-purple-800'
    };
    return priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TicketIcon className="h-5 w-5 mr-2" />
          Recent Tickets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentTickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{ticket.title}</h3>
                  <Badge variant="outline">{ticket.id}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>By: {ticket.createdBy}</span>
                  <span>Category: {ticket.category}</span>
                  <span>{ticket.createdAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusBadge(ticket.status)}>
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge className={getPriorityBadge(ticket.priority)}>
                  {ticket.priority.toUpperCase()}
                </Badge>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTicketsTable;
