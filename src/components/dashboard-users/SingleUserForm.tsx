
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { CITY_OPTIONS, CLUSTER_OPTIONS, ROLE_OPTIONS } from '@/data/formOptions';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  userId: z.string().min(1, { message: 'User ID is required' }),
  employeeId: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  cluster: z.string().optional(),
  manager: z.string().optional(),
  role: z.string().min(1, { message: 'Please select a role' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export type UserFormValues = z.infer<typeof formSchema>;

interface SingleUserFormProps {
  onSuccess?: () => void;
}

const SingleUserForm: React.FC<SingleUserFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [availableClusters, setAvailableClusters] = useState<string[]>([]);
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      userId: '',
      employeeId: '',
      phone: '',
      city: '',
      cluster: '',
      manager: '',
      role: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onCityChange = (city: string) => {
    setSelectedCity(city);
    form.setValue('city', city);
    form.setValue('cluster', ''); // Reset cluster when city changes
    
    if (city && CLUSTER_OPTIONS[city]) {
      setAvailableClusters(CLUSTER_OPTIONS[city]);
    } else {
      setAvailableClusters([]);
    }
  };

  const onSubmit = async (values: UserFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Insert the new dashboard user
      const { data, error } = await supabase
        .from('dashboard_users')
        .insert({
          name: values.name,
          email: values.email,
          user_id: values.userId,
          employee_id: values.employeeId || null,
          phone: values.phone || null,
          city: values.city || null,
          cluster: values.cluster || null,
          manager: values.manager || null,
          role: values.role,
          password: values.password,
          created_by: user?.id
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error adding dashboard user:", error);
        toast({
          title: "Error",
          description: `Failed to add dashboard user: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Dashboard user added successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate to security management to assign permissions
        navigate('/admin/dashboard-users/security');
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Add New Dashboard User</CardTitle>
        <CardDescription>
          Create a new dashboard user account with specific permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="12345" {...field} />
                    </FormControl>
                    <FormDescription>
                      Numeric ID for internal references
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="E12345" {...field} />
                    </FormControl>
                    <FormDescription>
                      If this user is an existing employee, you can link their employee ID
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The role defines the base level of access
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select 
                      onValueChange={(value) => onCityChange(value)} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CITY_OPTIONS.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cluster"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cluster</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!selectedCity || availableClusters.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a cluster" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableClusters.map((cluster) => (
                          <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select a city first to choose a cluster
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="manager"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manager</FormLabel>
                  <FormControl>
                    <Input placeholder="Manager name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <CardFooter className="flex justify-end px-0 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="mr-2"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </>
  );
};

export default SingleUserForm;
