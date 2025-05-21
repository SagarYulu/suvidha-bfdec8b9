
import React from 'react';
import AdminLayout from "@/components/AdminLayout";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const SentimentAnalysis: React.FC = () => {
  return (
    <AdminLayout title="Sentiment Analysis">
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Feature Removed</AlertTitle>
        <AlertDescription>
          The sentiment analysis feature has been removed from this application.
          Please navigate to another section of the dashboard.
        </AlertDescription>
      </Alert>
    </AdminLayout>
  );
};

export default SentimentAnalysis;
