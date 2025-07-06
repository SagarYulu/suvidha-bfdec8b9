
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Database, Upload, Download, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import { ApiClient } from '@/services/apiClient';

interface MigrationStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message?: string;
}

interface MigrationConfig {
  sourceType: 'mysql' | 'postgresql' | 'csv' | 'json';
  sourceConnection?: string;
  targetTable: string;
  mappingRules: Record<string, string>;
  transformRules: string[];
}

const DataMigrationTool: React.FC = () => {
  const [migrationConfig, setMigrationConfig] = useState<MigrationConfig>({
    sourceType: 'csv',
    targetTable: '',
    mappingRules: {},
    transformRules: []
  });
  const [migrationSteps, setMigrationSteps] = useState<MigrationStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const defaultSteps: MigrationStep[] = [
    { id: 'validate', name: 'Validate Source Data', status: 'pending', progress: 0 },
    { id: 'backup', name: 'Create Backup', status: 'pending', progress: 0 },
    { id: 'transform', name: 'Transform Data', status: 'pending', progress: 0 },
    { id: 'migrate', name: 'Migrate Data', status: 'pending', progress: 0 },
    { id: 'verify', name: 'Verify Migration', status: 'pending', progress: 0 }
  ];

  const availableTables = [
    'employees',
    'issues',
    'sentiment_feedback',
    'issue_comments',
    'master_cities',
    'master_clusters',
    'master_roles'
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const startMigration = async () => {
    if (!migrationConfig.targetTable) return;

    setIsRunning(true);
    setMigrationSteps(defaultSteps.map(step => ({ ...step, status: 'pending', progress: 0 })));
    setOverallProgress(0);

    try {
      for (let i = 0; i < defaultSteps.length; i++) {
        const step = defaultSteps[i];
        
        // Update step to running
        setMigrationSteps(prev => prev.map((s, index) => 
          index === i ? { ...s, status: 'running' } : s
        ));

        try {
          await simulateStepExecution(step, i);
          
          // Update step to completed
          setMigrationSteps(prev => prev.map((s, index) => 
            index === i ? { ...s, status: 'completed', progress: 100 } : s
          ));

          // Update overall progress
          setOverallProgress(((i + 1) / defaultSteps.length) * 100);
        } catch (error) {
          // Update step to failed
          setMigrationSteps(prev => prev.map((s, index) => 
            index === i ? { 
              ...s, 
              status: 'failed', 
              message: error instanceof Error ? error.message : 'Step failed'
            } : s
          ));
          break;
        }

        // Small delay between steps
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } finally {
      setIsRunning(false);
    }
  };

  const simulateStepExecution = async (step: MigrationStep, stepIndex: number) => {
    const duration = 3000 + Math.random() * 2000; // 3-5 seconds
    const startTime = Date.now();

    return new Promise<void>((resolve, reject) => {
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        
        setMigrationSteps(prev => prev.map((s, index) => 
          index === stepIndex ? { ...s, progress } : s
        ));

        if (progress >= 100) {
          clearInterval(progressInterval);
          
          // Simulate occasional failures
          if (Math.random() < 0.05) { // 5% failure rate
            reject(new Error(`${step.name} failed due to data validation error`));
          } else {
            resolve();
          }
        }
      }, 100);
    });
  };

  const downloadTemplate = () => {
    let csvContent = '';
    
    switch (migrationConfig.targetTable) {
      case 'employees':
        csvContent = [
          'name,email,phone,role,city,cluster,employee_id',
          'John Doe,john@company.com,9876543210,Driver,Mumbai,Zone A,EMP001'
        ].join('\n');
        break;
      case 'sentiment_feedback':
        csvContent = [
          'employee_id,rating,feedback,tags,created_at',
          'EMP001,4,"Good work environment","work_environment,management",2024-01-15T10:30:00Z'
        ].join('\n');
        break;
      default:
        csvContent = 'Please select a target table first';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${migrationConfig.targetTable}_template.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getStepIcon = (status: MigrationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'running':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Migration Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Source Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sourceType">Source Type</Label>
              <Select 
                value={migrationConfig.sourceType} 
                onValueChange={(value: any) => setMigrationConfig(prev => ({ ...prev, sourceType: value }))}
              >
                <SelectTrigger id="sourceType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV File</SelectItem>
                  <SelectItem value="json">JSON File</SelectItem>
                  <SelectItem value="mysql">MySQL Database</SelectItem>
                  <SelectItem value="postgresql">PostgreSQL Database</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetTable">Target Table</Label>
              <Select 
                value={migrationConfig.targetTable} 
                onValueChange={(value) => setMigrationConfig(prev => ({ ...prev, targetTable: value }))}
              >
                <SelectTrigger id="targetTable">
                  <SelectValue placeholder="Select target table" />
                </SelectTrigger>
                <SelectContent>
                  {availableTables.map(table => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Upload for CSV/JSON */}
          {(migrationConfig.sourceType === 'csv' || migrationConfig.sourceType === 'json') && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Upload Source File</Label>
                {migrationConfig.targetTable && (
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-1" />
                    Download Template
                  </Button>
                )}
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Input
                  type="file"
                  accept={migrationConfig.sourceType === 'csv' ? '.csv' : '.json'}
                  onChange={handleFileUpload}
                  className="hidden"
                  id="migration-file-upload"
                />
                <label htmlFor="migration-file-upload" className="cursor-pointer">
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-green-600 mx-auto" />
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-600">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <p className="text-gray-600">Click to upload {migrationConfig.sourceType.toUpperCase()} file</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Database Connection for MySQL/PostgreSQL */}
          {(migrationConfig.sourceType === 'mysql' || migrationConfig.sourceType === 'postgresql') && (
            <div>
              <Label htmlFor="connectionString">Database Connection String</Label>
              <Input
                id="connectionString"
                placeholder={`${migrationConfig.sourceType}://user:password@host:port/database`}
                value={migrationConfig.sourceConnection || ''}
                onChange={(e) => setMigrationConfig(prev => ({ ...prev, sourceConnection: e.target.value }))}
              />
            </div>
          )}

          {/* Migration Progress */}
          {migrationSteps.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Migration Progress</h3>
                  <Badge variant={isRunning ? "default" : "secondary"}>
                    {isRunning ? "Running" : "Ready"}
                  </Badge>
                </div>
                {overallProgress > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span>{Math.round(overallProgress)}%</span>
                    </div>
                    <Progress value={overallProgress} />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {migrationSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getStepIcon(step.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{step.name}</span>
                          <Badge 
                            variant={
                              step.status === 'completed' ? 'default' :
                              step.status === 'failed' ? 'destructive' :
                              step.status === 'running' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {step.status}
                          </Badge>
                        </div>
                        {step.status === 'running' && (
                          <div className="mt-1">
                            <Progress value={step.progress} className="h-1" />
                          </div>
                        )}
                        {step.message && (
                          <p className="text-sm text-red-600 mt-1">{step.message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Start Migration Button */}
          <Button 
            onClick={startMigration}
            disabled={
              !migrationConfig.targetTable || 
              isRunning ||
              (migrationConfig.sourceType === 'csv' && !uploadedFile) ||
              (migrationConfig.sourceType === 'json' && !uploadedFile) ||
              ((migrationConfig.sourceType === 'mysql' || migrationConfig.sourceType === 'postgresql') && !migrationConfig.sourceConnection)
            }
            className="w-full"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Running Migration...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Migration
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataMigrationTool;
