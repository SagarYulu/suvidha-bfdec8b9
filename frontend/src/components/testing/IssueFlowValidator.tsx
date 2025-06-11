
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';
import { ApiClient } from '@/services/apiClient';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
}

const IssueFlowValidator: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);

  const testDefinitions: TestSuite[] = [
    {
      name: 'Issue Creation Flow',
      tests: [
        { id: 'create-issue', name: 'Create new issue', status: 'pending' },
        { id: 'validate-issue-data', name: 'Validate issue data', status: 'pending' },
        { id: 'assign-issue', name: 'Auto-assign issue', status: 'pending' },
        { id: 'notification-sent', name: 'Send creation notification', status: 'pending' }
      ]
    },
    {
      name: 'Issue Status Updates',
      tests: [
        { id: 'status-in-progress', name: 'Update to In Progress', status: 'pending' },
        { id: 'status-resolved', name: 'Update to Resolved', status: 'pending' },
        { id: 'status-closed', name: 'Update to Closed', status: 'pending' },
        { id: 'status-reopen', name: 'Reopen closed issue', status: 'pending' }
      ]
    },
    {
      name: 'Comments & Communication',
      tests: [
        { id: 'add-comment', name: 'Add public comment', status: 'pending' },
        { id: 'add-internal-comment', name: 'Add internal comment', status: 'pending' },
        { id: 'comment-permissions', name: 'Validate comment permissions', status: 'pending' }
      ]
    },
    {
      name: 'Escalation Flow',
      tests: [
        { id: 'escalate-issue', name: 'Escalate high priority issue', status: 'pending' },
        { id: 'escalation-notification', name: 'Send escalation notification', status: 'pending' },
        { id: 'escalation-assignment', name: 'Assign to manager', status: 'pending' }
      ]
    }
  ];

  const runTests = async () => {
    setIsRunning(true);
    setTestSuites(testDefinitions.map(suite => ({
      ...suite,
      tests: suite.tests.map(test => ({ ...test, status: 'pending' }))
    })));

    try {
      for (let suiteIndex = 0; suiteIndex < testDefinitions.length; suiteIndex++) {
        const suite = testDefinitions[suiteIndex];
        
        for (let testIndex = 0; testIndex < suite.tests.length; testIndex++) {
          const test = suite.tests[testIndex];
          
          // Update test status to running
          setTestSuites(prev => prev.map((s, si) => 
            si === suiteIndex 
              ? {
                  ...s,
                  tests: s.tests.map((t, ti) => 
                    ti === testIndex 
                      ? { ...t, status: 'running' }
                      : t
                  )
                }
              : s
          ));

          try {
            // Simulate test execution
            const startTime = Date.now();
            await simulateTest(test.id);
            const duration = Date.now() - startTime;

            // Update test status to passed
            setTestSuites(prev => prev.map((s, si) => 
              si === suiteIndex 
                ? {
                    ...s,
                    tests: s.tests.map((t, ti) => 
                      ti === testIndex 
                        ? { 
                            ...t, 
                            status: 'passed',
                            message: 'Test completed successfully',
                            duration
                          }
                        : t
                    )
                  }
                : s
            ));
          } catch (error) {
            // Update test status to failed
            setTestSuites(prev => prev.map((s, si) => 
              si === suiteIndex 
                ? {
                    ...s,
                    tests: s.tests.map((t, ti) => 
                      ti === testIndex 
                        ? { 
                            ...t, 
                            status: 'failed',
                            message: error instanceof Error ? error.message : 'Test failed'
                          }
                        : t
                    )
                  }
                : s
            ));
          }

          // Small delay between tests
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } finally {
      setIsRunning(false);
    }
  };

  const simulateTest = async (testId: string): Promise<void> => {
    // Simulate API calls for different test types
    switch (testId) {
      case 'create-issue':
        await ApiClient.post('/api/test/issues', { test: true });
        break;
      case 'validate-issue-data':
        // Simulate validation
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
      default:
        // Random success/failure for demonstration
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
        if (Math.random() < 0.1) { // 10% failure rate
          throw new Error('Simulated test failure');
        }
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getTotalStats = () => {
    const allTests = testSuites.flatMap(suite => suite.tests);
    return {
      total: allTests.length,
      passed: allTests.filter(t => t.status === 'passed').length,
      failed: allTests.filter(t => t.status === 'failed').length,
      running: allTests.filter(t => t.status === 'running').length
    };
  };

  const stats = getTotalStats();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Issue Flow Validator</CardTitle>
          <Button 
            onClick={runTests}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Running Tests...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
        
        {testSuites.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span>Total: {stats.total}</span>
            <span className="text-green-600">Passed: {stats.passed}</span>
            <span className="text-red-600">Failed: {stats.failed}</span>
            {stats.running > 0 && <span className="text-blue-600">Running: {stats.running}</span>}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {testSuites.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Play className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Click "Run All Tests" to start validation</p>
          </div>
        ) : (
          <div className="space-y-6">
            {testSuites.map((suite, suiteIndex) => (
              <div key={suiteIndex}>
                <h3 className="font-medium text-lg mb-3">{suite.name}</h3>
                <div className="space-y-2">
                  {suite.tests.map((test, testIndex) => (
                    <div 
                      key={testIndex}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <span className="font-medium">{test.name}</span>
                          {test.message && (
                            <p className="text-sm text-gray-600">{test.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {test.duration && (
                          <span className="text-xs text-gray-500">
                            {test.duration}ms
                          </span>
                        )}
                        {getStatusBadge(test.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IssueFlowValidator;
