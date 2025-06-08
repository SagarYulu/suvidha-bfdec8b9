
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getCities, getClusters, createCluster, updateCluster, deleteCluster } from '@/services/masterDataService';
import { useAuth } from '@/contexts/AuthContext';

export const ClustersManagement: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCluster, setEditingCluster] = useState<any>(null);
  const [clusterName, setClusterName] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');

  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: getCities,
  });

  const { data: clusters, isLoading } = useQuery({
    queryKey: ['clusters'],
    queryFn: getClusters,
  });

  const createMutation = useMutation({
    mutationFn: ({ name, cityId }: { name: string; cityId: string }) => 
      createCluster(name, cityId, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      setIsCreateDialogOpen(false);
      setClusterName('');
      setSelectedCityId('');
      toast.success('Cluster created successfully');
    },
    onError: () => {
      toast.error('Failed to create cluster');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name, cityId }: { id: string; name: string; cityId: string }) => 
      updateCluster(id, name, cityId, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      setIsEditDialogOpen(false);
      setEditingCluster(null);
      setClusterName('');
      setSelectedCityId('');
      toast.success('Cluster updated successfully');
    },
    onError: () => {
      toast.error('Failed to update cluster');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCluster(id, user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clusters'] });
      toast.success('Cluster deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete cluster');
    },
  });

  const handleCreate = () => {
    if (clusterName.trim() && selectedCityId) {
      createMutation.mutate({ name: clusterName.trim(), cityId: selectedCityId });
    }
  };

  const handleUpdate = () => {
    if (editingCluster && clusterName.trim() && selectedCityId) {
      updateMutation.mutate({ 
        id: editingCluster.id, 
        name: clusterName.trim(), 
        cityId: selectedCityId 
      });
    }
  };

  const handleEdit = (cluster: any) => {
    setEditingCluster(cluster);
    setClusterName(cluster.name);
    setSelectedCityId(cluster.cityId);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this cluster?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading clusters...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Clusters ({clusters?.length || 0})</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Cluster
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Cluster</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="citySelect">City</Label>
                <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities?.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="clusterName">Cluster Name</Label>
                <Input
                  id="clusterName"
                  value={clusterName}
                  onChange={(e) => setClusterName(e.target.value)}
                  placeholder="Enter cluster name"
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
            <TableHead>City</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clusters?.map((cluster) => (
            <TableRow key={cluster.id}>
              <TableCell>
                <Badge variant="secondary">{cluster.name}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{cluster.cityName}</Badge>
              </TableCell>
              <TableCell>{new Date(cluster.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(cluster.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(cluster)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(cluster.id)}
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
            <DialogTitle>Edit Cluster</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editCitySelect">City</Label>
              <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {cities?.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editClusterName">Cluster Name</Label>
              <Input
                id="editClusterName"
                value={clusterName}
                onChange={(e) => setClusterName(e.target.value)}
                placeholder="Enter cluster name"
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
