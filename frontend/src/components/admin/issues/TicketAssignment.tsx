
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, UserPlus, Clock } from 'lucide-react';
import { Issue } from '@/types';

interface Agent {
  id: string;
  name: string;
  email: string;
  workload: number;
  status: 'available' | 'busy' | 'offline';
}

interface TicketAssignmentProps {
  issue: Issue;
  onAssign: (agentId: string) => void;
  isLoading?: boolean;
}

const TicketAssignment: React.FC<TicketAssignmentProps> = ({
  issue,
  onAssign,
  isLoading = false
}) => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const agents: Agent[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', workload: 5, status: 'available' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', workload: 8, status: 'busy' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', workload: 3, status: 'available' },
    { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', workload: 0, status: 'offline' }
  ];

  const handleAssign = async () => {
    if (!selectedAgent || isAssigning) return;

    setIsAssigning(true);
    try {
      await onAssign(selectedAgent);
      setSelectedAgent('');
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const availableAgents = agents.filter(agent => agent.status !== 'offline');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {issue.assignedTo ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">Currently Assigned</p>
                <p className="text-sm text-green-600">{issue.assignedTo}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <User className="h-3 w-3 mr-1" />
                Assigned
              </Badge>
            </div>
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <p className="text-sm text-orange-800">This issue is not assigned to anyone</p>
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-2 block">
            {issue.assignedTo ? 'Reassign to' : 'Assign to'}
          </label>
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger>
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              {availableAgents.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-xs text-gray-500">{agent.email}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {agent.workload} tickets
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleAssign}
          disabled={!selectedAgent || isAssigning || isLoading}
          className="w-full"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {isAssigning ? 'Assigning...' : issue.assignedTo ? 'Reassign' : 'Assign'}
        </Button>

        <div className="border-t pt-4">
          <h4 className="font-medium text-sm mb-2">Agent Workload</h4>
          <div className="space-y-2">
            {availableAgents.map(agent => (
              <div key={agent.id} className="flex items-center justify-between text-sm">
                <span>{agent.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${Math.min((agent.workload / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{agent.workload}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketAssignment;
