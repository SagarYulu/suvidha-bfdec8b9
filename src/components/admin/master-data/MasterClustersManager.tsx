
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCities, getClusters, createCluster, updateCluster, deleteCluster } from '@/services/masterDataService';
import { useAuth } from '@/contexts/AuthContext';

const MasterClustersManager = () => {
  const { authState } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCluster, setEditingCluster] = useState(null);
  const [clusterName, setClusterName] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');

  const { data: cities = [] } = useQuery({
    queryKey: ['master-cities'],
    queryFn: getCities
  });

  const { data: clusters = [], isLoading } = useQuery({
    queryKey: ['master-clusters'],
    queryFn: getClusters
  });

  const createMutation = useMutation({
    mutationFn: ({ name, cityId }: { name: string; cityId: string }) => 
      createCluster(name, cityId, authState.user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-clusters'] });
      setIsCreateOpen(false);
      setClusterName('');
      setSelectedCityId('');
      toast({ description: 'Cluster created successfully' });
    },
    onError: () => {
      toast({ variant: 'destructive', description: 'Failed to create cluster' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name, cityId }: { id: string; name: string; cityId: string }) => 
      updateCluster(id, name, cityId, authState.user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-clusters'] });
      setEditingCluster(null);
      setClusterName('');
      setSelectedCityId('');
      toast({ description: 'Cluster updated successfully' });
    },
    onError: () => {
      toast({ variant: 'destructive', description: 'Failed to update cluster' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCluster(id, authState.user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-clusters'] });
      toast({ description: 'Cluster deleted successfully' });
    },
    onError: () => {
      toast({ variant: 'destructive', description: 'Failed to delete cluster' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clusterName.trim() || !selectedCityId) return;

    if (editingCluster) {
      updateMutation.mutate({ 
        id: editingCluster.id, 
        name: clusterName, 
        cityId: selectedCityId 
      });
    } else {
      createMutation.mutate({ name: clusterName, cityId: selectedCityId });
    }
  };

  const startEdit = (cluster) => {
    setEditingCluster(cluster);
    setClusterName(cluster.name);
    setSelectedCityId(cluster.cityId);
  };

  const cancelEdit = () => {
    setEditingCluster(null);
    setClusterName('');
    setSelectedCityId('');
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading clusters...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Clusters ({clusters.length})</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Cluster
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Cluster</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="clusterName">Cluster Name</Label>
                <Input
                  id="clusterName"
                  value={clusterName}
                  onChange={(e) => setClusterName(e.target.value)}
                  placeholder="Enter cluster name"
                  required
                />
              </div>
              <div>
                <Label>City</Label>
                <Select value={selectedCityId} onValueChange={setSelectedCityId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Cluster'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {clusters.map((cluster) => (
          <Card key={cluster.id}>
            <CardContent className="p-4">
              {editingCluster?.id === cluster.id ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={clusterName}
                      onChange={(e) => setClusterName(e.target.value)}
                      placeholder="Cluster name"
                      required
                    />
                    <Select value={selectedCityId} onValueChange={setSelectedCityId} required>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                      Save
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{cluster.name}</h4>
                    <p className="text-sm text-gray-500">
                      City: {cluster.cityName} | Created: {new Date(cluster.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(cluster)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => deleteMutation.mutate(cluster.id)}
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
        {clusters.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No clusters found. Add your first cluster to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterClustersManager;
