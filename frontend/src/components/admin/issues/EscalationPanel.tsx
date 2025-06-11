
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ArrowUp, Clock } from 'lucide-react';

interface EscalationPanelProps {
  issueId: string;
  currentPriority: string;
  onEscalate: (escalationData: EscalationData) => void;
}

interface EscalationData {
  newPriority: string;
  reason: string;
  escalateTo?: string;
}

const EscalationPanel: React.FC<EscalationPanelProps> = ({
  issueId,
  currentPriority,
  onEscalate
}) => {
  const [newPriority, setNewPriority] = useState('');
  const [reason, setReason] = useState('');
  const [escalateTo, setEscalateTo] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ];

  const escalationLevels = [
    'Team Lead',
    'Manager',
    'Senior Manager',
    'Director'
  ];

  const handleEscalate = async () => {
    if (!newPriority || !reason) return;

    setIsEscalating(true);
    try {
      await onEscalate({
        newPriority,
        reason,
        escalateTo
      });
      
      // Reset form
      setNewPriority('');
      setReason('');
      setEscalateTo('');
    } catch (error) {
      console.error('Escalation failed:', error);
    } finally {
      setIsEscalating(false);
    }
  };

  const canEscalate = currentPriority !== 'critical';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Escalation Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canEscalate && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This issue is already at the highest priority level.
            </AlertDescription>
          </Alert>
        )}

        {canEscalate && (
          <>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Current Priority</p>
                <p className={`text-sm capitalize ${
                  priorities.find(p => p.value === currentPriority)?.color || 'text-gray-600'
                }`}>
                  {currentPriority}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">New Priority Level</label>
              <Select value={newPriority} onValueChange={setNewPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities
                    .filter(p => p.value !== currentPriority)
                    .map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <div className="flex items-center gap-2">
                          <ArrowUp className={`h-3 w-3 ${priority.color}`} />
                          <span className={priority.color}>{priority.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Escalate To</label>
              <Select value={escalateTo} onValueChange={setEscalateTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select escalation level" />
                </SelectTrigger>
                <SelectContent>
                  {escalationLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Escalation Reason</label>
              <Textarea
                placeholder="Please provide a detailed reason for escalation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button 
              onClick={handleEscalate}
              disabled={!newPriority || !reason || isEscalating}
              className="w-full"
              variant="destructive"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {isEscalating ? 'Escalating...' : 'Escalate Issue'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EscalationPanel;
