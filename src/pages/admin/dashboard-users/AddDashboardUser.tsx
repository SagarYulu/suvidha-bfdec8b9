
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/components/AdminLayout';
import SingleUserForm from '@/components/dashboard-users/SingleUserForm';

const AddDashboardUser: React.FC = () => {
  return (
    <AdminLayout title="Add Dashboard User" requiredPermission="create:dashboardUser">
      <div className="max-w-3xl mx-auto py-6">
        <Card className="shadow-md">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-xl">Add New User</CardTitle>
          </CardHeader>
          <div className="p-6">
            <SingleUserForm />
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AddDashboardUser;
