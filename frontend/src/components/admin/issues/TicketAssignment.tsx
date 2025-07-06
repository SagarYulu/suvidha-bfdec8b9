
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { User, UserCheck, Clock, AlertCircle } from 'lucide-react';

interface TicketAssignmentProps {
  issueId: string;
  currentAssignee?: string;
  availableAgents: Array<{ id: string; name: string; workload: number; isAvailable: boolean }>;
  onAssign: (agentId: string, notes?: string) => void;
}

const TicketAssignment: React.FC<TicketAssignmentProps> = ({
  issueId,
  currentAssignee,
  availableAgents,
  onAssign
}) => {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedAgent) return;

    setIsAssigning(true);
    try {
      await onAssign(selectedAgent, assignmentNotes);
      setSelectedAgent('');
      setAssignmentNotes('');
    } catch (error) {
      console.error('Assignment failed:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload <= 3) return 'text-green-600';
    if (workload <= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWorkloadLabel = (workload: number) => {
    if (workload <= 3) return 'Low';
    if (workload <= 7) return 'Medium';
    return 'High';
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
        {currentAssignee && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Currently assigned to:</span>
              <Badge variant="secondary">{currentAssignee}</Badge>
            </div>
          </div>
        )}

        {/* Agent Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Assign to Agent</label>
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger>
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              {availableAgents.map((agent) => (
                <SelectItem 
                  key={agent.id} 
                  value={agent.id}
                  disabled={!agent.isAvailable}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span>{agent.name}</span>
                      {!agent.isAvailable && (
                        <Badge variant="destructive" className="text-xs">
                          Unavailable
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className={`text-xs ${getWorkloadColor(agent.workload)}`}>
                        {agent.workload} tickets ({getWorkloadLabel(agent.workload)})
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Agent Info */}
        {selectedAgent && (
          <div className="bg-gray-50 p-3 rounded-lg">
            {(() => {
              const agent = availableAgents.find(a => a.id === selectedAgent);
              if (!agent) return null;
              
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{agent.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${getWorkloadColor(agent.workload)}`}>
                        Current workload: {agent.workload} tickets
                      </span>
                    </div>
                  </div>
                  {agent.workload >= 8 && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-3 w-3" />
                      <span>High workload - consider redistributing tickets</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Assignment Notes */}
        <div>
          <label className="text-sm font-medium mb-2 block">Assignment Notes (Optional)</label>
          <Textarea
            placeholder="Add any notes for the assigned agent..."
            value={assignmentNotes}
            onChange={(e) => setAssignmentNotes(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* Assignment Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={handleAssign}
            disabled={!selectedAgent || isAssigning}
            className="flex-1"
          >
            <User className="h-4 w-4 mr-2" />
            {isAssigning ? 'Assigning...' : 'Assign Ticket'}
          </Button>
          
          {currentAssignee && (
            <Button 
              variant="outline" 
              onClick={() => onAssign('', 'Ticket unassigned')}
              disabled={isAssigning}
            >
              Unassign
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600 border-t pt-3">
          <div>
            <p className="font-medium">{availableAgents.filter(a => a.isAvailable).length}</p>
            <p>Available</p>
          </div>
          <div>
            <p className="font-medium">{availableAgents.filter(a => a.workload <= 3).length}</p>
            <p>Low Load</p>
          </div>
          <div>
            <p className="font-medium">{availableAgents.filter(a => a.workload >= 8).length}</p>
            <p>High Load</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketAssignment;
