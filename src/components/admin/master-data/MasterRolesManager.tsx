
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoles, createRole, updateRole, deleteRole } from '@/services/masterDataService';
import { useAuth } from '@/contexts/AuthContext';

const MasterRolesManager = () => {
  const { authState } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleName, setRoleName] = useState('');

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['master-roles'],
    queryFn: getRoles
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createRole(name, authState.user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-roles'] });
      setIsCreateOpen(false);
      setRoleName('');
      toast({ description: 'Role created successfully' });
    },
    onError: () => {
      toast({ variant: 'destructive', description: 'Failed to create role' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => 
      updateRole(id, name, authState.user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-roles'] });
      setEditingRole(null);
      setRoleName('');
      toast({ description: 'Role updated successfully' });
    },
    onError: () => {
      toast({ variant: 'destructive', description: 'Failed to update role' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRole(id, authState.user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-roles'] });
      toast({ description: 'Role deleted successfully' });
    },
    onError: () => {
      toast({ variant: 'destructive', description: 'Failed to delete role' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, name: roleName });
    } else {
      createMutation.mutate(roleName);
    }
  };

  const startEdit = (role) => {
    setEditingRole(role);
    setRoleName(role.name);
  };

  const cancelEdit = () => {
    setEditingRole(null);
    setRoleName('');
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading roles...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Roles ({roles.length})</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Enter role name"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Role'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardContent className="p-4">
              {editingRole?.id === role.id ? (
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                  <Input
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                    Save
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{role.name}</h4>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(role.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(role)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => deleteMutation.mutate(role.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {roles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No roles found. Add your first role to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterRolesManager;
