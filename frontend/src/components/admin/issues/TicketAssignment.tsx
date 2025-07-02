
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Save, UserCheck } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  email: string;
  workload: number;
  isAvailable: boolean;
}

interface TicketAssignmentProps {
  issueId: string;
  currentAssignee?: string;
  agents: Agent[];
  onAssign: (agentId: string) => void;
  canAssign?: boolean;
  isLoading?: boolean;
}

const TicketAssignment: React.FC<TicketAssignmentProps> = ({
  issueId,
  currentAssignee,
  agents,
  onAssign,
  canAssign = false,
  isLoading = false
}) => {
  const [selectedAgent, setSelectedAgent] = useState<string>(currentAssignee || '');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedAgent || isAssigning) return;

    setIsAssigning(true);
    try {
      await onAssign(selectedAgent);
    } finally {
      setIsAssigning(false);
    }
  };

  const getCurrentAssignee = () => {
    return agents.find(agent => agent.id === currentAssignee);
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 10) return 'text-red-600';
    if (workload >= 7) return 'text-orange-600';
    if (workload >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Ticket Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Assignment */}
        {currentAssignee ? (
          <div>
            <h4 className="font-medium mb-2">Currently Assigned To</h4>
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm">
                {getCurrentAssignee()?.name.charAt(0) || 'A'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{getCurrentAssignee()?.name || currentAssignee}</p>
                <p className="text-xs text-gray-600">{getCurrentAssignee()?.email}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                <UserCheck className="h-3 w-3 mr-1" />
                Assigned
              </Badge>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800 font-medium">Unassigned</p>
            <p className="text-xs text-orange-600">This ticket needs to be assigned to an agent</p>
          </div>
        )}

        {canAssign && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">
              {currentAssignee ? 'Reassign Ticket' : 'Assign Ticket'}
            </h4>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Select Agent</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent..." />
                </SelectTrigger>
                <SelectContent>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id} disabled={!agent.isAvailable}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-xs text-gray-600">{agent.email}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className={`text-xs ${getWorkloadColor(agent.workload)}`}>
                            {agent.workload} tickets
                          </span>
                          {!agent.isAvailable && (
                            <Badge variant="outline" className="text-xs">
                              Unavailable
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAssign}
              disabled={!selectedAgent || selectedAgent === currentAssignee || isAssigning || isLoading}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {isAssigning ? 'Assigning...' : 
               currentAssignee ? 'Reassign Ticket' : 'Assign Ticket'}
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketAssignment;
