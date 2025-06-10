
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  UserCog, 
  Mail, 
  Shield, 
  Save,
  ArrowLeft,
  Plus,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddDashboardUser: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    permissions: [] as string[]
  });

  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    'Super Admin',
    'HR Admin', 
    'Operations Manager',
    'Team Lead',
    'Support Agent'
  ];

  const availablePermissions = [
    'view:dashboard',
    'manage:issues',
    'manage:users',
    'manage:analytics',
    'access:security',
    'manage:settings',
    'view_analytics',
    'create:dashboardUser'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Creating dashboard user:', formData);
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate('/admin/users');
    } catch (error) {
      console.error('Error creating dashboard user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addPermission = (permission: string) => {
    if (!formData.permissions.includes(permission)) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permission]
      }));
    }
  };

  const removePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.filter(p => p !== permission)
    }));
  };

  const getRolePermissions = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return availablePermissions;
      case 'HR Admin':
        return ['view:dashboard', 'manage:issues', 'manage:users', 'manage:analytics'];
      case 'Operations Manager':
        return ['view:dashboard', 'manage:issues', 'view_analytics'];
      case 'Team Lead':
        return ['view:dashboard', 'manage:issues'];
      case 'Support Agent':
        return ['view:dashboard'];
      default:
        return [];
    }
  };

  const handleRoleChange = (role: string) => {
    const rolePermissions = getRolePermissions(role);
    setFormData(prev => ({
      ...prev,
      role,
      permissions: rolePermissions
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/users')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <h1 className="text-3xl font-bold flex items-center">
          <UserCog className="h-8 w-8 mr-3 text-blue-600" />
          Add Dashboard User
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Role *</label>
              <div className="relative">
                <Shield className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <select 
                  className="w-full p-2 pl-8 border rounded-md"
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  required
                >
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Role determines default permissions. You can customize permissions below.
              </p>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium mb-2">Permissions</label>
              
              {/* Current Permissions */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Assigned Permissions:</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.permissions.length > 0 ? (
                    formData.permissions.map((permission) => (
                      <Badge 
                        key={permission} 
                        variant="secondary"
                        className="flex items-center space-x-1"
                      >
                        <span>{permission}</span>
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-600" 
                          onClick={() => removePermission(permission)}
                        />
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No permissions assigned</span>
                  )}
                </div>
              </div>

              {/* Available Permissions */}
              <div>
                <h4 className="text-sm font-medium mb-2">Available Permissions:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availablePermissions
                    .filter(permission => !formData.permissions.includes(permission))
                    .map((permission) => (
                      <Button
                        key={permission}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPermission(permission)}
                        className="justify-start"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {permission}
                      </Button>
                    ))}
                </div>
              </div>
            </div>

            {/* Role Descriptions */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Role Descriptions:</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Super Admin:</strong> Full access to all features and settings</div>
                  <div><strong>HR Admin:</strong> Manage users, issues, and view analytics</div>
                  <div><strong>Operations Manager:</strong> View dashboard, manage issues, view analytics</div>
                  <div><strong>Team Lead:</strong> View dashboard and manage assigned issues</div>
                  <div><strong>Support Agent:</strong> View dashboard only</div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex items-center space-x-4 pt-6">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Creating User...' : 'Create Dashboard User'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/admin/users')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddDashboardUser;
