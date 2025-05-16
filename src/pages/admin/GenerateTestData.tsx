
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateTestSentimentData } from '@/services/sentimentService';

const GenerateTestData = () => {
  const [employeeCount, setEmployeeCount] = useState<number>(10);
  const [entriesPerEmployee, setEntriesPerEmployee] = useState<number>(3);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{success?: boolean; message?: string}>({});

  const handleGenerate = async () => {
    setLoading(true);
    setStatus({});
    
    try {
      const result = await generateTestSentimentData(employeeCount, entriesPerEmployee);
      
      if (result) {
        setStatus({
          success: true,
          message: `Successfully generated ${employeeCount * entriesPerEmployee * 5} sentiment entries across 5 time periods.`
        });
      } else {
        setStatus({
          success: false,
          message: 'Failed to generate test data. Check the console for details.'
        });
      }
    } catch (error) {
      console.error("Error generating test data:", error);
      setStatus({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout 
      title="Generate Test Data" 
      requiredPermission="manage:settings"
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Generate Test Sentiment Data</CardTitle>
            <CardDescription>
              Generate sentiment ratings for employees across different time periods.
              This will create test data for current week, last week, last month, last quarter, and last year.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeCount">Number of Employees</Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    min={1}
                    max={50}
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entriesPerEmployee">Entries per Employee (per period)</Label>
                  <Input
                    id="entriesPerEmployee"
                    type="number"
                    min={1}
                    max={10}
                    value={entriesPerEmployee}
                    onChange={(e) => setEntriesPerEmployee(Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  This will generate <strong className="font-semibold">{employeeCount * entriesPerEmployee * 5} total entries</strong> across 5 time periods:
                  <br />
                  <span className="block mt-2 ml-4">• Current Week ({employeeCount * entriesPerEmployee} entries)</span>
                  <span className="block ml-4">• Last Week ({employeeCount * entriesPerEmployee} entries)</span>
                  <span className="block ml-4">• Last Month ({employeeCount * entriesPerEmployee} entries)</span>
                  <span className="block ml-4">• Last Quarter ({employeeCount * entriesPerEmployee} entries)</span>
                  <span className="block ml-4">• Last Year ({employeeCount * entriesPerEmployee} entries)</span>
                </p>
              </div>
              
              {status.message && (
                <Alert variant={status.success ? "default" : "destructive"}>
                  {status.success ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{status.success ? "Success" : "Error"}</AlertTitle>
                  <AlertDescription>{status.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleGenerate} 
              disabled={loading}
              className="ml-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Test Data'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default GenerateTestData;
