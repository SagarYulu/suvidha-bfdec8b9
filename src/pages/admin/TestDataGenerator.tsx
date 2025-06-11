
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { generateTestSentimentData } from "@/services/sentimentService";

const TestDataGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<{
    employeesProcessed: number;
    totalEntriesCreated: number;
    success: boolean;
  } | null>(null);

  const handleGenerateData = async () => {
    try {
      setIsGenerating(true);
      const result = await generateTestSentimentData();
      
      // Check if result exists and has the expected properties
      if (result && typeof result === 'object' && 'employeesProcessed' in result) {
        setResults(result);
        toast({
          variant: "default",
          title: "Test Data Generated",
          description: `Processed ${result.employeesProcessed} employees with ${result.totalEntriesCreated} entries created.`
        });
      } else {
        // Handle case where function returns void or null
        setResults(null);
        toast({
          variant: "default",
          title: "Test Data Generator",
          description: "Sentiment functionality has been removed from this application."
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setResults(null);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while processing your request."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AdminLayout title="Test Data Generator">
      <div className="container mx-auto py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generate Test Data</CardTitle>
            <CardDescription>
              This feature has been disabled as sentiment functionality has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleGenerateData} 
              disabled={isGenerating} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? "Generating..." : "Generate Test Data"}
            </Button>
            
            {results && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h3 className="font-medium text-blue-800">Results</h3>
                <ul className="mt-2 list-disc pl-5 text-blue-700">
                  <li>Employees processed: {results.employeesProcessed}</li>
                  <li>Total entries created: {results.totalEntriesCreated}</li>
                  <li>Status: {results.success ? "Success" : "Partial success"}</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default TestDataGenerator;
