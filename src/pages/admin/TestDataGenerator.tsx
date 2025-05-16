
import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateTestSentimentData } from '@/services/sentimentService';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TestDataGenerator = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<null | {
    employeesSelected: number;
    entriesCreated: number;
    periodsGenerated: string[];
  }>(null);

  const handleGenerateData = async () => {
    try {
      setIsGenerating(true);
      const result = await generateTestSentimentData();
      setResults(result);
      toast({
        title: "Test Data Generated",
        description: `Created ${result.entriesCreated} sentiment entries for ${result.employeesSelected} employees`,
        variant: "success"
      });
    } catch (error) {
      console.error("Error generating test data:", error);
      toast({
        title: "Error",
        description: "Failed to generate test data. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Sentiment Test Data Generator</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generate Test Sentiment Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              This tool will randomly select employees and generate test sentiment data across different time periods.
              Each employee will have 2-3 entries per time period with varying sentiment ratings.
            </p>
            
            <div className="flex gap-2 items-center">
              <Button 
                onClick={handleGenerateData} 
                disabled={isGenerating}
                className="max-w-xs"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Data...
                  </>
                ) : "Generate Test Data"}
              </Button>
              
              {isGenerating && <p className="text-sm text-gray-500">This may take a moment...</p>}
            </div>
          </CardContent>
        </Card>
        
        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Generation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Summary:</h3>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>Selected <span className="font-semibold">{results.employeesSelected}</span> employees</li>
                    <li>Created <span className="font-semibold">{results.entriesCreated}</span> sentiment entries</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium">Time Periods Generated:</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {results.periodsGenerated.map((period, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50">{period}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default TestDataGenerator;
