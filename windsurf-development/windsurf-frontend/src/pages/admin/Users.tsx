
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminUsers: React.FC = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.getUsers(),
  });

  if (isLoading) return <div>Loading users...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Users Management</h1>
      
      <div className="grid gap-4">
        {users?.data?.map((user: any) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle>{user.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Email:</span> {user.email}
                </div>
                <div>
                  <span className="font-medium">Role:</span> {user.role}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
