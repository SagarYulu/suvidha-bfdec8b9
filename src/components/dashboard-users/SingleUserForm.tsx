
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { mockSupabase as supabase } from '@/lib/mockSupabase';

interface SingleUserFormProps {
  onUserCreated?: () => void;
}

const SingleUserForm: React.FC<SingleUserFormProps> = ({ onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    phone: '',
    city: '',
    cluster: '',
    manager: '',
    role: '',
    password: ''
  });
  
  const [cities, setCities] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      // Mock fetching of master data
      const citiesResponse = await supabase.from('master_cities').select('*');
      const clustersResponse = await supabase.from('master_clusters').select('*');
      const rolesResponse = await supabase.from('master_roles').select('*');

      const citiesResult = await citiesResponse.maybeSingle();
      const clustersResult = await clustersResponse.maybeSingle();
      const rolesResult = await rolesResponse.maybeSingle();

      setCities(citiesResult.data || []);
      setClusters(clustersResult.data || []);
      setRoles(rolesResult.data || []);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Mock user creation
      const { data, error } = await supabase.from('dashboard_users').insert(formData);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "User created successfully",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        employeeId: '',
        phone: '',
        city: '',
        cluster: '',
        manager: '',
        role: '',
        password: ''
      });

      onUserCreated?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New User</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Employee ID</label>
              <Input
                value={formData.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">City</label>
              <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cluster</label>
              <Select value={formData.cluster} onValueChange={(value) => handleInputChange('cluster', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cluster" />
                </SelectTrigger>
                <SelectContent>
                  {clusters.map((cluster) => (
                    <SelectItem key={cluster.id} value={cluster.name}>
                      {cluster.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Manager</label>
              <Input
                value={formData.manager}
                onChange={(e) => handleInputChange('manager', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Role *</label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Password *</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating...' : 'Create User'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SingleUserForm;
