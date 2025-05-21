
import React from 'react';
import AdminLayout from "@/components/AdminLayout";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const TestDataGenerator: React.FC = () => {
  // Mock function that would have generated test data
  const handleGenerateTestData = () => {
    console.log("Generate test data placeholder - sentiment functionality has been removed");
    // This would be where test data generation logic would go
  };

  return (
    <AdminLayout title="Test Data Generator">
      <div className="space-y-6">
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Limited Functionality</AlertTitle>
          <AlertDescription>
            The sentiment analysis feature has been removed. This test data generator 
            has limited functionality as a result.
          </AlertDescription>
        </Alert>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Generate Test Data</h2>
          <p className="mb-4">
            This tool allows you to generate sample data for testing purposes.
          </p>
          
          <Button onClick={handleGenerateTestData}>
            Generate Test Data
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TestDataGenerator;
