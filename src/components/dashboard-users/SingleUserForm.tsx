
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { CITY_OPTIONS, CLUSTER_OPTIONS, DASHBOARD_USER_ROLES } from '@/data/formOptions';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  userId: z.string().min(1, { message: 'User ID is required' }),
  employeeId: z.string().min(1, { message: 'Employee ID is required' }),
  phone: z.string().min(1, { message: 'Phone number is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  cluster: z.string().min(1, { message: 'Cluster is required' }),
  manager: z.string().min(1, { message: 'Manager is required' }),
  role: z.string().min(1, { message: 'Please select a role' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
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
      password: ''
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
      console.log("Creating new dashboard user with values:", values);
      
      const { data, error } = await supabase
        .from('dashboard_users')
        .insert({
          name: values.name,
          email: values.email,
          user_id: values.userId,
          employee_id: values.employeeId,
          phone: values.phone,
          city: values.city,
          cluster: values.cluster,
          manager: values.manager,
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
      
      console.log("Dashboard user created successfully:", data);
      
      toast({
        title: "Success",
        description: "Dashboard user added successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate to dashboard users page after successful creation
        navigate('/admin/dashboard-users');
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User ID *</FormLabel>
                <FormControl>
                  <Input placeholder="Numeric User ID (e.g. 1001)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee ID *</FormLabel>
                <FormControl>
                  <Input placeholder="Employee ID (e.g. YL001)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Full Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone *</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="9876543210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
                      <SelectValue placeholder="Select city" />
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
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                      <SelectValue placeholder="Select a city first" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableClusters.map((cluster) => (
                      <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DASHBOARD_USER_ROLES.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password *</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/admin/dashboard-users')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding User..." : "Add User"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SingleUserForm;
