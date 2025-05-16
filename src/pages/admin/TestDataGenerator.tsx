
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateTestSentimentData } from '@/services/testDataService';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

const TestDataGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ 
    success?: boolean;
    count?: number;
    error?: string;
  }>({});
  
  const queryClient = useQueryClient();
  
  const handleGenerateSentimentData = async () => {
    try {
      setLoading(true);
      setResult({});
      
      const result = await generateTestSentimentData();
      
      setResult(result);
      
      if (result.success) {
        toast({
          title: "Test Data Generated",
          description: `Successfully inserted ${result.count} sentiment records.`,
        });
        
        // Invalidate any relevant queries
        queryClient.invalidateQueries({ queryKey: ['sentiment'] });
      } else {
        toast({
          variant: "destructive",
          title: "Error Generating Test Data",
          description: result.error || "An unknown error occurred",
        });
      }
    } catch (error: any) {
      setResult({ 
        success: false, 
        error: error.message || "An unexpected error occurred" 
      });
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AdminLayout 
      title="Test Data Generator" 
      requiredPermission="manage:analytics"
    >
      <Card>
        <CardHeader>
          <CardTitle>Generate Test Sentiment Data</CardTitle>
          <CardDescription>
            This utility will generate test sentiment data for employees across different time periods.
            The data will be inserted into the employee_sentiment table.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Generated Data Will Include:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>2-3 sentiment entries per employee for each time period</li>
                <li>Time periods: current week, last week, last month, last quarter, last year</li>
                <li>Ratings from 1-5 with corresponding sentiment labels</li>
                <li>1-2 randomly selected tags from the sentiment_tags table</li>
                <li>City, cluster, and role data from the employee record</li>
              </ul>
            </div>
            
            {result.success === true && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  Successfully generated and inserted {result.count} test sentiment records.
                </AlertDescription>
              </Alert>
            )}
            
            {result.success === false && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {result.error || "Failed to generate test data"}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerateSentimentData} 
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Test Sentiment Data'
            )}
          </Button>
        </CardFooter>
      </Card>
    </AdminLayout>
  );
};

export default TestDataGenerator;
