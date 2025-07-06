
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { ApiClient } from '@/services/apiClient';

interface SingleUserFormProps {
  onSuccess?: () => void;
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

const ROLES = ['Admin', 'HR Admin', 'Manager', 'Agent'];

const SingleUserForm: React.FC<SingleUserFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    permissions: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await ApiClient.post('/api/dashboard-users', formData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        role: '',
        permissions: []
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create dashboard user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add Dashboard User
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {AVAILABLE_PERMISSIONS.map(permission => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={formData.permissions.includes(permission)}
                    onCheckedChange={(checked) => handlePermissionChange(permission, !!checked)}
                  />
                  <Label htmlFor={permission} className="text-sm">
                    {permission.replace(':', ' ').replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating User...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Create Dashboard User
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SingleUserForm;
