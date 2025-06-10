
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TestTube, 
  Play,
  RotateCcw,
  Database,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const TestDashboard: React.FC = () => {
  const [runningTests, setRunningTests] = useState<Record<string, boolean>>({});

  const testSuites = [
    {
      id: 'auth',
      name: 'User Authentication Tests',
      status: 'passed',
      tests: 15,
      passed: 15,
      failed: 0,
      icon: Users
    },
    {
      id: 'issues',
      name: 'Issue Management Tests',
      status: 'failed',
      tests: 12,
      passed: 10,
      failed: 2,
      icon: FileText
    },
    {
      id: 'analytics',
      name: 'Analytics Tests',
      status: 'running',
      tests: 8,
      passed: 6,
      failed: 0,
      icon: Database
    },
    {
      id: 'api',
      name: 'API Endpoint Tests',
      status: 'passed',
      tests: 20,
      passed: 20,
      failed: 0,
      icon: Database
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const runTest = (testId: string) => {
    setRunningTests(prev => ({ ...prev, [testId]: true }));
    setTimeout(() => {
      setRunningTests(prev => ({ ...prev, [testId]: false }));
    }, 3000);
  };

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.tests, 0);
  const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passed, 0);
  const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failed, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center">
          <TestTube className="h-8 w-8 mr-3 text-blue-600" />
          Test Dashboard
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Test Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-xs text-muted-foreground">
              Across all test suites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalPassed}</div>
            <p className="text-xs text-muted-foreground">
              {((totalPassed / totalTests) * 100).toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalFailed}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">94.2%</div>
            <p className="text-xs text-muted-foreground">
              Code coverage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test Suites */}
      <Card>
        <CardHeader>
          <CardTitle>Test Suites</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testSuites.map((suite) => (
              <div 
                key={suite.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <suite.icon className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium">{suite.name}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>Total: {suite.tests}</span>
                      <span className="text-green-600">Passed: {suite.passed}</span>
                      {suite.failed > 0 && (
                        <span className="text-red-600">Failed: {suite.failed}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(suite.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(suite.status)}
                      <span>{suite.status}</span>
                    </div>
                  </Badge>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => runTest(suite.id)}
                    disabled={runningTests[suite.id]}
                  >
                    {runningTests[suite.id] ? (
                      <Clock className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {runningTests[suite.id] ? 'Running...' : 'Run'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Login functionality test</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-xs text-gray-500">2 mins ago</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Issue creation API test</span>
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-xs text-gray-500">5 mins ago</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Analytics dashboard load test</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-xs text-gray-500">8 mins ago</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDashboard;
