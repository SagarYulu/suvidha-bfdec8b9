
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Users } from 'lucide-react';
import { ApiClient } from '@/services/apiClient';

interface Issue {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface EscalationPanelProps {
  issue: Issue;
  onEscalate: (escalationData: any) => void;
  isLoading?: boolean;
}

const EscalationPanel: React.FC<EscalationPanelProps> = ({
  issue,
  onEscalate,
  isLoading = false
}) => {
  const [escalationType, setEscalationType] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [assignTo, setAssignTo] = useState('');

  const escalationTypes = [
    { value: 'sla_breach', label: 'SLA Breach' },
    { value: 'technical_complexity', label: 'Technical Complexity' },
    { value: 'customer_request', label: 'Customer Request' },
    { value: 'other', label: 'Other' }
  ];

  const managers = [
    { value: 'manager1', label: 'John Smith - Senior Manager' },
    { value: 'manager2', label: 'Sarah Johnson - Team Lead' },
    { value: 'manager3', label: 'Mike Brown - Technical Lead' }
  ];

  const handleEscalate = async () => {
    if (!escalationType || !escalationReason || !assignTo) return;

    const escalationData = {
      type: escalationType,
      reason: escalationReason,
      assignedTo: assignTo,
      issueId: issue.id
    };

    try {
      await ApiClient.post('/api/issues/escalate', escalationData);
      onEscalate(escalationData);
    } catch (error) {
      console.error('Failed to escalate issue:', error);
    }
  };

  const canEscalate = issue.priority === 'critical' || issue.priority === 'high';

  if (!canEscalate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Escalation Not Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            This issue does not meet the criteria for escalation. Only high and critical priority issues can be escalated.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Escalate Issue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Escalation Type</label>
          <Select value={escalationType} onValueChange={setEscalationType}>
            <SelectTrigger>
              <SelectValue placeholder="Select escalation type" />
            </SelectTrigger>
            <SelectContent>
              {escalationTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Assign To</label>
          <Select value={assignTo} onValueChange={setAssignTo}>
            <SelectTrigger>
              <SelectValue placeholder="Select manager" />
            </SelectTrigger>
            <SelectContent>
              {managers.map(manager => (
                <SelectItem key={manager.value} value={manager.value}>
                  {manager.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Escalation Reason</label>
          <Textarea
            placeholder="Provide detailed reason for escalation..."
            value={escalationReason}
            onChange={(e) => setEscalationReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <Button 
          onClick={handleEscalate}
          disabled={!escalationType || !escalationReason || !assignTo || isLoading}
          className="w-full"
        >
          {isLoading ? 'Escalating...' : 'Escalate Issue'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default EscalationPanel;
