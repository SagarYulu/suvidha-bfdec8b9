
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowRight, CheckCircle } from 'lucide-react';
import { ApiClient } from '@/services/apiClient';

interface AssignmentRule {
  id: string;
  issueType: string;
  priority: string;
  assigneeType: 'auto' | 'manual' | 'round_robin';
  assigneeId?: string;
  conditions: string[];
}

interface AssignmentFlowProps {
  issueId?: string;
  onAssignmentComplete?: (assignment: any) => void;
}

const AssignmentFlow: React.FC<AssignmentFlowProps> = ({
  issueId,
  onAssignmentComplete
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [assignmentData, setAssignmentData] = useState({
    assigneeId: '',
    priority: '',
    escalationLevel: 'standard',
    notes: ''
  });
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    fetchAvailableAgents();
  }, []);

  const fetchAvailableAgents = async () => {
    try {
      const response = await ApiClient.get('/api/agents/available');
      setAvailableAgents(response.data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const steps = [
    { id: 1, name: 'Select Agent', description: 'Choose the best agent for this issue' },
    { id: 2, name: 'Set Priority', description: 'Determine priority and escalation level' },
    { id: 3, name: 'Review & Assign', description: 'Review assignment details and confirm' }
  ];

  const handleAssignment = async () => {
    if (!issueId) return;

    setIsLoading(true);
    try {
      const response = await ApiClient.post(`/api/issues/${issueId}/assign`, assignmentData);
      onAssignmentComplete?.(response.data);
    } catch (error) {
      console.error('Assignment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Select Agent</h3>
            <Select 
              value={assignmentData.assigneeId} 
              onValueChange={(value) => setAssignmentData(prev => ({ ...prev, assigneeId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent" />
              </SelectTrigger>
              <SelectContent>
                {availableAgents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{agent.name}</span>
                      <div className="flex gap-1">
                        <Badge variant="secondary">{agent.currentLoad} issues</Badge>
                        <Badge 
                          variant={agent.status === 'available' ? 'default' : 'secondary'}
                          className={agent.status === 'available' ? 'bg-green-500' : ''}
                        >
                          {agent.status}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Set Priority & Escalation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select 
                  value={assignmentData.priority} 
                  onValueChange={(value) => setAssignmentData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Escalation Level</label>
                <Select 
                  value={assignmentData.escalationLevel} 
                  onValueChange={(value) => setAssignmentData(prev => ({ ...prev, escalationLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="expedited">Expedited</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        const selectedAgent = availableAgents.find(a => a.id === assignmentData.assigneeId);
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Review Assignment</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Agent:</span>
                <span className="text-sm">{selectedAgent?.name || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Priority:</span>
                <Badge variant="outline">{assignmentData.priority || 'Not set'}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Escalation:</span>
                <span className="text-sm">{assignmentData.escalationLevel}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Assignment Flow
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= step.id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-2 hidden md:block">
                <p className="text-sm font-medium">{step.name}</p>
                <p className="text-xs text-gray-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep < steps.length ? (
            <Button 
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={
                (currentStep === 1 && !assignmentData.assigneeId) ||
                (currentStep === 2 && !assignmentData.priority)
              }
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleAssignment}
              disabled={isLoading || !assignmentData.assigneeId || !assignmentData.priority}
            >
              {isLoading ? 'Assigning...' : 'Complete Assignment'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentFlow;
