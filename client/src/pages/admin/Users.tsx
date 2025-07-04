import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/services/apiClient';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, User, UserCheck } from 'lucide-react';

// Form schemas
const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  empId: z.string().min(1, 'Employee ID is required'),
  city: z.string().min(1, 'City is required'),
  cluster: z.string().min(1, 'Cluster is required'),
  role: z.string().min(1, 'Role is required'),
  manager: z.string().min(1, 'Manager is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const dashboardUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  role: z.string().min(1, 'Role is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  empId: string;
  city: string;
  cluster: string;
  role: string;
  manager: string;
  createdAt: string;
}

interface DashboardUser {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
}

export default function Users() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dashboardUsers, setDashboardUsers] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [isDashboardUserDialogOpen, setIsDashboardUserDialogOpen] = useState(false);

  const employeeForm = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      empId: '',
      city: '',
      cluster: '',
      role: '',
      manager: '',
      password: '',
    },
  });

  const dashboardUserForm = useForm({
    resolver: zodResolver(dashboardUserSchema),
    defaultValues: {
      name: '',
      email: '',
      username: '',
      role: '',
      password: '',
    },
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesData, dashboardUsersData] = await Promise.all([
        apiClient.getEmployees(),
        apiClient.getDashboardUsers()
      ]);
      
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      setDashboardUsers(Array.isArray(dashboardUsersData) ? dashboardUsersData : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateEmployee = async (data: any) => {
    try {
      await apiClient.createEmployee(data);
      toast({
        title: "Success",
        description: "Employee created successfully",
      });
      setIsEmployeeDialogOpen(false);
      employeeForm.reset();
      fetchData();
    } catch (error) {
      console.error('Error creating employee:', error);
      toast({
        title: "Error",
        description: "Failed to create employee",
        variant: "destructive",
      });
    }
  };

  const handleCreateDashboardUser = async (data: any) => {
    try {
      await apiClient.createDashboardUser(data);
      toast({
        title: "Success",
        description: "Dashboard user created successfully",
      });
      setIsDashboardUserDialogOpen(false);
      dashboardUserForm.reset();
      fetchData();
    } catch (error) {
      console.error('Error creating dashboard user:', error);
      toast({
        title: "Error",
        description: "Failed to create dashboard user",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout title="User Management" requiredPermission="manage:users">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>

        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employees ({employees.length})
            </TabsTrigger>
            <TabsTrigger value="dashboard-users" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Dashboard Users ({dashboardUsers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Employees</CardTitle>
                <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Employee
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Employee</DialogTitle>
                    </DialogHeader>
                    <Form {...employeeForm}>
                      <form onSubmit={employeeForm.handleSubmit(handleCreateEmployee)} className="space-y-4">
                        <FormField
                          control={employeeForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={employeeForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={employeeForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={employeeForm.control}
                          name="empId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Employee ID</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={employeeForm.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select city" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                                    <SelectItem value="Delhi">Delhi</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={employeeForm.control}
                          name="cluster"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cluster</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={employeeForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Delivery Executive">Delivery Executive</SelectItem>
                                    <SelectItem value="Pilot">Pilot</SelectItem>
                                    <SelectItem value="Mechanic">Mechanic</SelectItem>
                                    <SelectItem value="Marshal">Marshal</SelectItem>
                                    <SelectItem value="Operator">Operator</SelectItem>
                                    <SelectItem value="Bike Captain">Bike Captain</SelectItem>
                                    <SelectItem value="Yulu Captain">Yulu Captain</SelectItem>
                                    <SelectItem value="Zone Screener">Zone Screener</SelectItem>
                                    <SelectItem value="Bike Fitter">Bike Fitter</SelectItem>
                                    <SelectItem value="Cleaning Associate">Cleaning Associate</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={employeeForm.control}
                          name="manager"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Manager</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={employeeForm.control}
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
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsEmployeeDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Create Employee</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Cluster</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Manager</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : employees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">No employees found</TableCell>
                      </TableRow>
                    ) : (
                      employees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.name}</TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell>{employee.empId}</TableCell>
                          <TableCell>{employee.city}</TableCell>
                          <TableCell>{employee.cluster}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{employee.role}</Badge>
                          </TableCell>
                          <TableCell>{employee.manager}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard-users" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Dashboard Users</CardTitle>
                <Dialog open={isDashboardUserDialogOpen} onOpenChange={setIsDashboardUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Dashboard User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Dashboard User</DialogTitle>
                    </DialogHeader>
                    <Form {...dashboardUserForm}>
                      <form onSubmit={dashboardUserForm.handleSubmit(handleCreateDashboardUser)} className="space-y-4">
                        <FormField
                          control={dashboardUserForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={dashboardUserForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={dashboardUserForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={dashboardUserForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="hr_admin">HR Admin</SelectItem>
                                    <SelectItem value="city_head">City Head</SelectItem>
                                    <SelectItem value="security_admin">Security Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={dashboardUserForm.control}
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
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsDashboardUserDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Create User</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : dashboardUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No dashboard users found</TableCell>
                      </TableRow>
                    ) : (
                      dashboardUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{user.role}</Badge>
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}