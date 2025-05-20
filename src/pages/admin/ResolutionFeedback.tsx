
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import FeedbackAnalytics from "@/components/admin/feedback/FeedbackAnalytics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ResolutionFeedback = () => {
  // Mock data for demo purposes - in a real app, fetch from API
  const cities = ["Bangalore", "Delhi", "Mumbai", "Chennai"];
  const clusters = ["North", "South", "East", "West"];
  const ticketTypes = [
    { id: "salary", name: "Salary Issues" },
    { id: "leave", name: "Leave Requests" },
    { id: "equipment", name: "Equipment Issues" },
    { id: "benefits", name: "Benefits Queries" }
  ];

  return (
    <AdminLayout title="Resolution Feedback" requiredPermission="manage:analytics">
      <div className="space-y-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Database Tables Missing</AlertTitle>
          <AlertDescription>
            The required database tables for sentiment analysis haven't been created yet. Please contact your administrator.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="raw_data">Raw Feedback Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics" className="mt-6">
            <FeedbackAnalytics 
              cities={cities}
              clusters={clusters}
              ticketTypes={ticketTypes}
            />
          </TabsContent>
          
          <TabsContent value="raw_data">
            <div className="bg-white rounded-lg p-6 shadow">
              <p className="text-gray-500">
                The raw feedback data view is under development.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ResolutionFeedback;
