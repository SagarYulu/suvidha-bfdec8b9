
import React from 'react';
import { Card } from '@/components/ui/card';
import AdminLayout from '@/components/AdminLayout';
import SingleUserForm from '@/components/dashboard-users/SingleUserForm';

const AddDashboardUser: React.FC = () => {
  return (
    <AdminLayout title="Add Dashboard User" requiredPermission="create:dashboardUser">
      <div className="max-w-4xl mx-auto py-6">
        <Card>
          <SingleUserForm />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AddDashboardUser;
