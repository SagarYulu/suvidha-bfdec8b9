
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Shield, Save } from 'lucide-react';
import { ApiClient } from '@/services/apiClient';

interface Role {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
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

const RolePermissionsManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await ApiClient.get('/api/roles');
      setRoles(response.data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      // Mock data for development
      setRoles([
        {
          id: '1',
          name: 'Super Admin',
          permissions: AVAILABLE_PERMISSIONS,
          description: 'Full system access'
        },
        {
          id: '2',
          name: 'HR Admin',
          permissions: ['view:dashboard', 'manage:issues', 'manage:users'],
          description: 'HR department access'
        },
        {
          id: '3',
          name: 'Agent',
          permissions: ['view:dashboard', 'manage:issues'],
          description: 'Basic agent access'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStart = (role: Role) => {
    setEditingRole(role.id);
    setEditPermissions([...role.permissions]);
  };

  const handleEditCancel = () => {
    setEditingRole(null);
    setEditPermissions([]);
  };

  const handlePermissionToggle = (permission: string) => {
    setEditPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSave = async (roleId: string) => {
    try {
      await ApiClient.put(`/api/roles/${roleId}/permissions`, {
        permissions: editPermissions
      });
      
      setRoles(prev =>
        prev.map(role =>
          role.id === roleId
            ? { ...role, permissions: editPermissions }
            : role
        )
      );
      
      setEditingRole(null);
      setEditPermissions([]);
    } catch (error) {
      console.error('Failed to update role permissions:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions Manager</CardTitle>
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
          Role Permissions Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {roles.map(role => (
            <div key={role.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-lg">{role.name}</h4>
                  {role.description && (
                    <p className="text-sm text-gray-600">{role.description}</p>
                  )}
                  <Badge variant="outline" className="mt-1">
                    {role.permissions.length} permissions
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  {editingRole === role.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSave(role.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEditCancel}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditStart(role)}
                    >
                      Edit Permissions
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">Permissions:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AVAILABLE_PERMISSIONS.map(permission => {
                    const isChecked = editingRole === role.id
                      ? editPermissions.includes(permission)
                      : role.permissions.includes(permission);
                    
                    return (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          checked={isChecked}
                          disabled={editingRole !== role.id}
                          onCheckedChange={() => {
                            if (editingRole === role.id) {
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

export default RolePermissionsManager;
