
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import SingleUserForm from '@/components/dashboard-users/SingleUserForm';
import BulkUploadCard from '@/components/dashboard-users/BulkUploadCard';

const AddDashboardUser: React.FC = () => {
  const handleBulkUploadSuccess = () => {
    toast({
      title: "Success",
      description: "Dashboard users uploaded successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Dashboard User</h1>
        <p className="text-gray-600 mt-1">Create new dashboard user accounts with specific permissions</p>
      </div>

      <div className="max-w-4xl">
        <Tabs defaultValue="single">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="single">Single User</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
            <Card>
              <SingleUserForm />
            </Card>
          </TabsContent>
          
          <TabsContent value="bulk">
            <Card>
              <BulkUploadCard onUploadSuccess={handleBulkUploadSuccess} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AddDashboardUser;
