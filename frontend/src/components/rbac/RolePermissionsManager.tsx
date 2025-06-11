
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Edit, Trash2 } from 'lucide-react';
import { ApiClient } from '@/services/apiClient';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

const RolePermissionsManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] as string[] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    setIsLoading(true);
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        ApiClient.get('/api/admin/roles'),
        ApiClient.get('/api/admin/permissions')
      ]);
      
      setRoles(rolesResponse.data);
      setPermissions(permissionsResponse.data);
    } catch (error) {
      console.error('Failed to fetch roles and permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) return;

    try {
      const response = await ApiClient.post('/api/admin/roles', newRole);
      setRoles(prev => [...prev, response.data]);
      setNewRole({ name: '', description: '', permissions: [] });
      setIsCreatingRole(false);
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  const handleUpdateRolePermissions = async (roleId: string, permissions: string[]) => {
    try {
      await ApiClient.put(`/api/admin/roles/${roleId}/permissions`, { permissions });
      setRoles(prev => prev.map(role => 
        role.id === roleId ? { ...role, permissions } : role
      ));
    } catch (error) {
      console.error('Failed to update role permissions:', error);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      await ApiClient.delete(`/api/admin/roles/${roleId}`);
      setRoles(prev => prev.filter(role => role.id !== roleId));
      if (selectedRole === roleId) {
        setSelectedRole('');
      }
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    const role = roles.find(r => r.id === selectedRole);
    if (!role) return;

    const updatedPermissions = checked
      ? [...role.permissions, permissionId]
      : role.permissions.filter(p => p !== permissionId);

    handleUpdateRolePermissions(selectedRole, updatedPermissions);
  };

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role & Permissions Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role & Permissions Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Roles Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Roles</h3>
                <Button 
                  onClick={() => setIsCreatingRole(true)}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Role
                </Button>
              </div>

              {isCreatingRole && (
                <Card className="mb-4">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="roleName">Role Name</Label>
                        <Input
                          id="roleName"
                          value={newRole.name}
                          onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter role name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="roleDescription">Description</Label>
                        <Input
                          id="roleDescription"
                          value={newRole.description}
                          onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter role description"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateRole} size="sm">
                          Create
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCreatingRole(false)}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {roles.map((role) => (
                  <div 
                    key={role.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedRole === role.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{role.name}</h4>
                        <p className="text-sm text-gray-600">{role.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {role.permissions.length} permissions
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRole(role.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Permissions Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">
                Permissions {selectedRoleData && `for ${selectedRoleData.name}`}
              </h3>

              {selectedRoleData ? (
                <div className="space-y-4">
                  {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                    <Card key={category}>
                      <CardHeader className="pb-2">
                        <h4 className="font-medium capitalize">{category}</h4>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {categoryPermissions.map((permission) => (
                            <div key={permission.id} className="flex items-start space-x-2">
                              <Checkbox
                                id={permission.id}
                                checked={selectedRoleData.permissions.includes(permission.id)}
                                onCheckedChange={(checked) => 
                                  handlePermissionToggle(permission.id, checked as boolean)
                                }
                              />
                              <div className="flex-1">
                                <Label 
                                  htmlFor={permission.id}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {permission.name}
                                </Label>
                                <p className="text-xs text-gray-600">{permission.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a role to manage its permissions</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RolePermissionsManager;
