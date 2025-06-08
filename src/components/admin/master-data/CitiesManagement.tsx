
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getCities, createCity, updateCity, deleteCity } from '@/services/masterDataService';
import { useAuth } from '@/contexts/AuthContext';

export const CitiesManagement: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<any>(null);
  const [cityName, setCityName] = useState('');

  const { data: cities, isLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: getCities,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createCity(name, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      setIsCreateDialogOpen(false);
      setCityName('');
      toast.success('City created successfully');
    },
    onError: () => {
      toast.error('Failed to create city');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => 
      updateCity(id, name, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      setIsEditDialogOpen(false);
      setEditingCity(null);
      setCityName('');
      toast.success('City updated successfully');
    },
    onError: () => {
      toast.error('Failed to update city');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCity(id, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      toast.success('City deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete city');
    },
  });

  const handleCreate = () => {
    if (cityName.trim()) {
      createMutation.mutate(cityName.trim());
    }
  };

  const handleUpdate = () => {
    if (editingCity && cityName.trim()) {
      updateMutation.mutate({ id: editingCity.id, name: cityName.trim() });
    }
  };

  const handleEdit = (city: any) => {
    setEditingCity(city);
    setCityName(city.name);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this city? This will also delete all associated clusters.')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading cities...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cities ({cities?.length || 0})</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add City
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New City</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cityName">City Name</Label>
                <Input
                  id="cityName"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder="Enter city name"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cities?.map((city) => (
            <TableRow key={city.id}>
              <TableCell>
                <Badge variant="secondary">{city.name}</Badge>
              </TableCell>
              <TableCell>{new Date(city.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(city.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(city)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(city.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit City</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editCityName">City Name</Label>
              <Input
                id="editCityName"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="Enter city name"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
