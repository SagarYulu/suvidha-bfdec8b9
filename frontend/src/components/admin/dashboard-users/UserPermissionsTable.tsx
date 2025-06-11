
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Save, X, Shield } from 'lucide-react';
import { ApiClient } from '@/services/apiClient';

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

const AVAILABLE_PERMISSIONS = [
  'view:dashboard',
  'manage:issues',
  'manage:users',
  'manage:analytics',
  'create:dashboardUser',
  'access:security',
  'manage:settings',
  'view_analytics'
];

const UserPermissionsTable: React.FC = () => {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await ApiClient.get('/api/dashboard-users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      // Mock data for development
      setUsers([
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'Super Admin',
          permissions: AVAILABLE_PERMISSIONS,
          isActive: true
        },
        {
          id: '2',
          name: 'HR Manager',
          email: 'hr@example.com',
          role: 'HR Admin',
          permissions: ['view:dashboard', 'manage:issues', 'manage:users'],
          isActive: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStart = (user: DashboardUser) => {
    setEditingUser(user.id);
    setEditPermissions([...user.permissions]);
  };

  const handleEditCancel = () => {
    setEditingUser(null);
    setEditPermissions([]);
  };

  const handlePermissionToggle = (permission: string) => {
    setEditPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = async (userId: string) => {
    try {
      await ApiClient.put(`/api/dashboard-users/${userId}/permissions`, {
        permissions: editPermissions
      });
      
      setUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, permissions: editPermissions }
            : user
        )
      );
      
      setEditingUser(null);
      setEditPermissions([]);
    } catch (error) {
      console.error('Failed to update permissions:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Permissions Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map(user => (
            <div key={user.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <Badge variant="outline" className="mt-1">{user.role}</Badge>
                </div>
                
                <div className="flex gap-2">
                  {editingUser === user.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSave(user.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEditCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditStart(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Permissions:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {AVAILABLE_PERMISSIONS.map(permission => {
                    const isChecked = editingUser === user.id
                      ? editPermissions.includes(permission)
                      : user.permissions.includes(permission);
                    
                    return (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          checked={isChecked}
                          disabled={editingUser !== user.id}
                          onCheckedChange={() => {
                            if (editingUser === user.id) {
                              handlePermissionToggle(permission);
                            }
                          }}
                        />
                        <span className="text-sm">
                          {permission.replace(':', ' ').replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPermissionsTable;
