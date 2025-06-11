
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shield, Users, Key, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const AccessControl: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Mock data - replace with actual API calls
      setRoles([
        {
          id: '1',
          name: 'Admin',
          description: 'Full system access',
          permissions: ['manage_users', 'view_analytics', 'manage_settings']
        },
        {
          id: '2',
          name: 'Manager',
          description: 'Team management access',
          permissions: ['view_analytics', 'assign_issues']
        },
        {
          id: '3',
          name: 'Agent',
          description: 'Issue handling access',
          permissions: ['view_issues', 'update_issues']
        }
      ]);

      setPermissions([
        {
          id: 'manage_users',
          name: 'Manage Users',
          description: 'Create, update, and delete users',
          category: 'User Management'
        },
        {
          id: 'view_analytics',
          name: 'View Analytics',
          description: 'Access to analytics and reports',
          category: 'Analytics'
        },
        {
          id: 'manage_settings',
          name: 'Manage Settings',
          description: 'Configure system settings',
          category: 'System'
        },
        {
          id: 'assign_issues',
          name: 'Assign Issues',
          description: 'Assign issues to team members',
          category: 'Issue Management'
        },
        {
          id: 'view_issues',
          name: 'View Issues',
          description: 'View assigned issues',
          category: 'Issue Management'
        },
        {
          id: 'update_issues',
          name: 'Update Issues',
          description: 'Update issue status and details',
          category: 'Issue Management'
        }
      ]);
    } catch (error) {
      toast.error('Failed to load access control data');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = async (roleId: string, permissionId: string) => {
    try {
      setRoles(prev => prev.map(role => {
        if (role.id === roleId) {
          const hasPermission = role.permissions.includes(permissionId);
          return {
            ...role,
            permissions: hasPermission
              ? role.permissions.filter(p => p !== permissionId)
              : [...role.permissions, permissionId]
          };
        }
        return role;
      }));
      
      toast.success('Permission updated');
    } catch (error) {
      toast.error('Failed to update permission');
    }
  };

  const permissionCategories = [...new Set(permissions.map(p => p.category))];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Access Control</h1>
        <p className="text-gray-600">Manage roles and permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {roles.map(role => (
              <div key={role.id} className="p-3 border rounded">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{role.name}</h3>
                  <Badge variant="outline">
                    {role.permissions.length} permissions
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{role.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Permissions Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {permissionCategories.map(category => (
                <div key={category}>
                  <h3 className="font-medium mb-3 text-sm text-gray-700">{category}</h3>
                  <div className="space-y-2">
                    {permissions
                      .filter(p => p.category === category)
                      .map(permission => (
                        <div key={permission.id} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{permission.name}</h4>
                              <p className="text-sm text-gray-600">{permission.description}</p>
                            </div>
                          </div>
                          <div className="flex gap-4 mt-3">
                            {roles.map(role => (
                              <div key={role.id} className="flex items-center gap-2">
                                <Switch
                                  checked={role.permissions.includes(permission.id)}
                                  onCheckedChange={() => togglePermission(role.id, permission.id)}
                                />
                                <span className="text-sm">{role.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessControl;
