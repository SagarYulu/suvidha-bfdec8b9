
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Play } from "lucide-react";

const IssueFlowValidator = () => {
  const [validationResults, setValidationResults] = useState<{[key: string]: 'valid' | 'invalid' | 'warning' | 'validating'}>({});

  const validations = [
    {
      id: 'issue-types',
      name: 'Issue Types Configuration',
      description: 'Validate all issue types and subtypes are properly configured',
      severity: 'high'
    },
    {
      id: 'user-permissions',
      name: 'User Permission Matrix',
      description: 'Verify role-based access control is working correctly',
      severity: 'high'
    },
    {
      id: 'mobile-compatibility',
      name: 'Mobile App Compatibility',
      description: 'Check mobile interface functionality and responsiveness',
      severity: 'medium'
    },
    {
      id: 'data-integrity',
      name: 'Data Integrity Checks',
      description: 'Validate database constraints and relationships',
      severity: 'high'
    },
    {
      id: 'notification-system',
      name: 'Notification System',
      description: 'Test email and in-app notification delivery',
      severity: 'medium'
    },
    {
      id: 'export-functionality',
      name: 'Export Functionality',
      description: 'Verify data export and report generation features',
      severity: 'low'
    }
  ];

  const runValidation = async (validationId: string) => {
    setValidationResults(prev => ({ ...prev, [validationId]: 'validating' }));
    
    // Simulate validation
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
    
    const outcomes = ['valid', 'invalid', 'warning'];
    const weights = [0.6, 0.2, 0.2]; // 60% valid, 20% invalid, 20% warning
    
    const randomValue = Math.random();
    let cumulativeWeight = 0;
    let result = 'valid';
    
    for (let i = 0; i < outcomes.length; i++) {
      cumulativeWeight += weights[i];
      if (randomValue <= cumulativeWeight) {
        result = outcomes[i];
        break;
      }
    }
    
    setValidationResults(prev => ({ ...prev, [validationId]: result as any }));
  };

  const runAllValidations = async () => {
    for (const validation of validations) {
      await runValidation(validation.id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'validating': return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default: return <Play className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid': return <Badge variant="secondary" className="bg-green-100 text-green-800">Valid</Badge>;
      case 'invalid': return <Badge variant="destructive">Invalid</Badge>;
      case 'warning': return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Warning</Badge>;
      case 'validating': return <Badge variant="outline" className="border-blue-500 text-blue-700">Validating</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium': return <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">Medium</Badge>;
      case 'low': return <Badge variant="secondary" className="text-xs">Low</Badge>;
      default: return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Issue Flow Validation</h3>
        <Button onClick={runAllValidations} className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Run All Validations
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {validations.map((validation) => (
          <Card key={validation.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{validation.name}</CardTitle>
                {getStatusIcon(validationResults[validation.id] || 'pending')}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(validationResults[validation.id] || 'pending')}
                {getSeverityBadge(validation.severity)}
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => runValidation(validation.id)}
                  disabled={validationResults[validation.id] === 'validating'}
                >
                  Validate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{validation.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IssueFlowValidator;
