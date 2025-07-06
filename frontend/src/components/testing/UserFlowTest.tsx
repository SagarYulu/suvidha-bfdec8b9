
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, User, Play, Clock } from 'lucide-react';
import { ApiClient } from '@/services/apiClient';

interface UserFlowStep {
  id: string;
  name: string;
  action: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  result?: any;
}

interface UserFlow {
  id: string;
  name: string;
  description: string;
  steps: UserFlowStep[];
}

const UserFlowTest: React.FC = () => {
  const [selectedFlow, setSelectedFlow] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [flows, setFlows] = useState<UserFlow[]>([]);

  const predefinedFlows: UserFlow[] = [
    {
      id: 'employee-feedback-flow',
      name: 'Employee Feedback Submission',
      description: 'Test the complete employee feedback submission process',
      steps: [
        { id: 'login', name: 'Employee Login', action: 'authenticate_employee', status: 'pending' },
        { id: 'navigate-feedback', name: 'Navigate to Feedback', action: 'navigate_to_feedback', status: 'pending' },
        { id: 'fill-form', name: 'Fill Feedback Form', action: 'fill_feedback_form', status: 'pending' },
        { id: 'submit-feedback', name: 'Submit Feedback', action: 'submit_feedback', status: 'pending' },
        { id: 'verify-submission', name: 'Verify Submission', action: 'verify_feedback_saved', status: 'pending' }
      ]
    },
    {
      id: 'issue-creation-flow',
      name: 'Issue Creation & Assignment',
      description: 'Test issue creation and automatic assignment process',
      steps: [
        { id: 'login-employee', name: 'Employee Login', action: 'authenticate_employee', status: 'pending' },
        { id: 'create-issue', name: 'Create Issue', action: 'create_new_issue', status: 'pending' },
        { id: 'auto-assign', name: 'Auto Assignment', action: 'verify_auto_assignment', status: 'pending' },
        { id: 'notify-agent', name: 'Agent Notification', action: 'verify_agent_notification', status: 'pending' },
        { id: 'agent-response', name: 'Agent Response', action: 'simulate_agent_response', status: 'pending' }
      ]
    },
    {
      id: 'admin-dashboard-flow',
      name: 'Admin Dashboard Operations',
      description: 'Test admin dashboard functionality and data access',
      steps: [
        { id: 'admin-login', name: 'Admin Login', action: 'authenticate_admin', status: 'pending' },
        { id: 'view-dashboard', name: 'View Dashboard', action: 'load_admin_dashboard', status: 'pending' },
        { id: 'export-data', name: 'Export Data', action: 'export_analytics_data', status: 'pending' },
        { id: 'manage-users', name: 'Manage Users', action: 'access_user_management', status: 'pending' },
        { id: 'view-reports', name: 'View Reports', action: 'generate_reports', status: 'pending' }
      ]
    }
  ];

  React.useEffect(() => {
    setFlows(predefinedFlows);
  }, []);

  const runFlow = async (flowId: string) => {
    const flow = flows.find(f => f.id === flowId);
    if (!flow) return;

    setIsRunning(true);
    setCurrentStep(0);

    // Reset all steps to pending
    setFlows(prev => prev.map(f => 
      f.id === flowId 
        ? { ...f, steps: f.steps.map(s => ({ ...s, status: 'pending' })) }
        : f
    ));

    try {
      for (let i = 0; i < flow.steps.length; i++) {
        setCurrentStep(i);
        const step = flow.steps[i];

        // Update step to running
        setFlows(prev => prev.map(f => 
          f.id === flowId 
            ? {
                ...f,
                steps: f.steps.map((s, index) => 
                  index === i ? { ...s, status: 'running' } : s
                )
              }
            : f
        ));

        try {
          const startTime = Date.now();
          const result = await executeStep(step.action);
          const duration = Date.now() - startTime;

          // Update step to passed
          setFlows(prev => prev.map(f => 
            f.id === flowId 
              ? {
                  ...f,
                  steps: f.steps.map((s, index) => 
                    index === i 
                      ? { ...s, status: 'passed', duration, result }
                      : s
                  )
                }
              : f
          ));
        } catch (error) {
          // Update step to failed
          setFlows(prev => prev.map(f => 
            f.id === flowId 
              ? {
                  ...f,
                  steps: f.steps.map((s, index) => 
                    index === i 
                      ? { 
                          ...s, 
                          status: 'failed', 
                          result: error instanceof Error ? error.message : 'Step failed'
                        }
                      : s
                  )
                }
              : f
          ));
          break; // Stop on failure
        }

        // Small delay between steps
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } finally {
      setIsRunning(false);
      setCurrentStep(-1);
    }
  };

  const executeStep = async (action: string): Promise<any> => {
    // Simulate different step actions
    switch (action) {
      case 'authenticate_employee':
        return await ApiClient.post('/api/test/auth/employee', { test: true });
      case 'authenticate_admin':
        return await ApiClient.post('/api/test/auth/admin', { test: true });
      case 'navigate_to_feedback':
        await new Promise(resolve => setTimeout(resolve, 500));
        return { navigated: true };
      case 'fill_feedback_form':
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { form_filled: true };
      case 'submit_feedback':
        return await ApiClient.post('/api/test/feedback', { rating: 4, comment: 'Test feedback' });
      case 'create_new_issue':
        return await ApiClient.post('/api/test/issues', { type: 'test_issue', description: 'Test issue creation' });
      default:
        // Simulate generic action
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
        if (Math.random() < 0.05) { // 5% failure rate
          throw new Error(`Failed to execute ${action}`);
        }
        return { success: true, action };
    }
  };

  const getStepIcon = (status: UserFlowStep['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'running':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>;
    }
  };

  const selectedFlowData = flows.find(f => f.id === selectedFlow);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Flow Testing
          </CardTitle>
          <div className="flex gap-2">
            <Select value={selectedFlow} onValueChange={setSelectedFlow}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a user flow" />
              </SelectTrigger>
              <SelectContent>
                {flows.map(flow => (
                  <SelectItem key={flow.id} value={flow.id}>
                    {flow.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={() => selectedFlow && runFlow(selectedFlow)}
              disabled={!selectedFlow || isRunning}
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Flow
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {selectedFlowData ? (
          <div>
            <div className="mb-6">
              <h3 className="font-medium text-lg">{selectedFlowData.name}</h3>
              <p className="text-gray-600">{selectedFlowData.description}</p>
            </div>

            <div className="space-y-4">
              {selectedFlowData.steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
                    currentStep === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getStepIcon(step.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{step.name}</span>
                      <Badge variant="outline" className="text-xs">
                        Step {index + 1}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{step.action}</p>
                    {step.result && step.status === 'failed' && (
                      <p className="text-sm text-red-600 mt-1">Error: {step.result}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {step.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{step.duration}ms</span>
                      </div>
                    )}
                    {step.status === 'passed' && (
                      <Badge className="bg-green-100 text-green-800">Passed</Badge>
                    )}
                    {step.status === 'failed' && (
                      <Badge className="bg-red-100 text-red-800">Failed</Badge>
                    )}
                    {step.status === 'running' && (
                      <Badge className="bg-blue-100 text-blue-800">Running</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Select a user flow to begin testing</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserFlowTest;
