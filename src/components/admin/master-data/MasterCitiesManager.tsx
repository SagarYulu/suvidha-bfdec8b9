
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCities, createCity, updateCity, deleteCity } from '@/services/masterDataService';
import { useAuth } from '@/contexts/AuthContext';

const MasterCitiesManager = () => {
  const { authState } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [cityName, setCityName] = useState('');

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['master-cities'],
    queryFn: getCities
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createCity(name, authState.user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-cities'] });
      setIsCreateOpen(false);
      setCityName('');
      toast({ description: 'City created successfully' });
    },
    onError: () => {
      toast({ variant: 'destructive', description: 'Failed to create city' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => 
      updateCity(id, name, authState.user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-cities'] });
      setEditingCity(null);
      setCityName('');
      toast({ description: 'City updated successfully' });
    },
    onError: () => {
      toast({ variant: 'destructive', description: 'Failed to update city' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCity(id, authState.user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-cities'] });
      toast({ description: 'City deleted successfully' });
    },
    onError: () => {
      toast({ variant: 'destructive', description: 'Failed to delete city' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName.trim()) return;

    if (editingCity) {
      updateMutation.mutate({ id: editingCity.id, name: cityName });
    } else {
      createMutation.mutate(cityName);
    }
  };

  const startEdit = (city) => {
    setEditingCity(city);
    setCityName(city.name);
  };

  const cancelEdit = () => {
    setEditingCity(null);
    setCityName('');
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading cities...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cities ({cities.length})</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add City
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New City</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cityName">City Name</Label>
                <Input
                  id="cityName"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder="Enter city name"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create City'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {cities.map((city) => (
          <Card key={city.id}>
            <CardContent className="p-4">
              {editingCity?.id === city.id ? (
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                  <Input
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
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
                    <h4 className="font-medium">{city.name}</h4>
                    <p className="text-sm text-gray-500">
                      Created: {new Date(city.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(city)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => deleteMutation.mutate(city.id)}
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
        {cities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No cities found. Add your first city to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterCitiesManager;
