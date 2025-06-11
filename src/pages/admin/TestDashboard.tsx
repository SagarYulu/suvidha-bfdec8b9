
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import UserFlowTest from '@/components/testing/UserFlowTest';
import IssueFlowValidator from '@/components/testing/IssueFlowValidator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TestDashboard: React.FC = () => {
  return (
    <AdminLayout title="Testing Dashboard">
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            Windsurf Development - Quality Assurance
          </h2>
          <p className="text-blue-700 text-sm">
            Comprehensive testing suite to validate 100% feature parity with the original project.
            All user flows, business logic, and UI components are tested here.
          </p>
        </div>

        <Tabs defaultValue="user-flows" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user-flows">User Flow Tests</TabsTrigger>
            <TabsTrigger value="issue-validation">Issue Flow Validation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="user-flows" className="space-y-4">
            <UserFlowTest />
          </TabsContent>
          
          <TabsContent value="issue-validation" className="space-y-4">
            <IssueFlowValidator />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default TestDashboard;
