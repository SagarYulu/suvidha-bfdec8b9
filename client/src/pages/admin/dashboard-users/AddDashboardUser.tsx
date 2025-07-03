
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
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
    <AdminLayout title="Add Dashboard User">
      <div className="max-w-4xl mx-auto py-6">
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
    </AdminLayout>
  );
};

export default AddDashboardUser;
