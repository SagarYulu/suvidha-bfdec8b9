
import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ResolutionFeedback = () => {
  return (
    <AdminLayout title="Resolution Feedback" requiredPermission="manage:analytics">
      <div className="space-y-6">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Feedback Module Removed</AlertTitle>
          <AlertDescription>
            The feedback module has been removed from this application.
          </AlertDescription>
        </Alert>

        <div className="bg-white rounded-lg p-6 shadow">
          <p className="text-gray-500">
            Feedback functionality is not available in this version.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ResolutionFeedback;
