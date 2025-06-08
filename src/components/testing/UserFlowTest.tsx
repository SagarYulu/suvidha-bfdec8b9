
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Play } from "lucide-react";

const UserFlowTest = () => {
  const [testResults, setTestResults] = useState<{[key: string]: 'passed' | 'failed' | 'running' | 'pending'}>({});

  const testSuites = [
    {
      id: 'admin-auth',
      name: 'Admin Authentication Flow',
      tests: [
        'Admin login with valid credentials',
        'Admin dashboard access',
        'Role-based menu visibility',
        'Logout functionality'
      ]
    },
    {
      id: 'mobile-auth',
      name: 'Mobile Authentication Flow',
      tests: [
        'Employee login with email/ID',
        'Mobile app access control',
        'Mobile issue creation',
        'Mobile issue viewing'
      ]
    },
    {
      id: 'issue-management',
      name: 'Issue Management Flow',
      tests: [
        'Create new issue',
        'Assign issue to team member',
        'Add comments to issue',
        'Update issue status',
        'Close issue'
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics & Reporting Flow',
      tests: [
        'View dashboard analytics',
        'Generate reports',
        'Export data',
        'Filter analytics data'
      ]
    }
  ];

  const runTest = async (suiteId: string) => {
    setTestResults(prev => ({ ...prev, [suiteId]: 'running' }));
    
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    const passed = Math.random() > 0.3; // 70% pass rate
    setTestResults(prev => ({ ...prev, [suiteId]: passed ? 'passed' : 'failed' }));
  };

  const runAllTests = async () => {
    for (const suite of testSuites) {
      await runTest(suite.id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default: return <Play className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed': return <Badge variant="secondary" className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      case 'running': return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Running</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">User Flow Tests</h3>
        <Button onClick={runAllTests} className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Run All Tests
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testSuites.map((suite) => (
          <Card key={suite.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{suite.name}</CardTitle>
                {getStatusIcon(testResults[suite.id] || 'pending')}
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(testResults[suite.id] || 'pending')}
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => runTest(suite.id)}
                  disabled={testResults[suite.id] === 'running'}
                >
                  Run Test
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-gray-600">
                {suite.tests.map((test, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    {test}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserFlowTest;
