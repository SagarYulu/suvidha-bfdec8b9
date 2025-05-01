
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { User } from "@/types";
import { getUsers } from "@/services/userService";
import { DashboardRole, createDashboardUser, assignDashboardRole } from "@/services/dashboardRoleService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import { Search, UserPlus } from "lucide-react";

const DashboardUsers = () => {
  const [dashboardUsers, setDashboardUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const { authState } = useAuth();

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: DashboardRole.OPS_HEAD
  });

  // Fetch dashboard users
  const fetchDashboardUsers = async () => {
    setIsLoading(true);
    try {
      const users = await getUsers();
      // Filter users who have dashboard roles
      const dashboardUsersOnly = users.filter(
        user => user.role === DashboardRole.ADMIN || user.role === DashboardRole.OPS_HEAD
      );
      
      setDashboardUsers(dashboardUsersOnly);
      setFilteredUsers(dashboardUsersOnly);
    } catch (error) {
      console.error("Error fetching dashboard users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardUsers();
  }, []);

  // Filter users when searchTerm changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = dashboardUsers.filter(
        user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(dashboardUsers);
    }
  }, [searchTerm, dashboardUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDashboardUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const success = await createDashboardUser(newUser);
      
      if (success) {
        setIsAddUserDialogOpen(false);
        toast({
          title: "Success",
          description: "Dashboard user added successfully",
        });
        
        // Reset form
        setNewUser({
          name: "",
          email: "",
          password: "",
          role: DashboardRole.OPS_HEAD
        });
        
        // Refresh user list
        fetchDashboardUsers();
      } else {
        toast({
          title: "Error",
          description: "Failed to add dashboard user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding dashboard user:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RoleProtectedRoute page="access_control" action="view">
      <AdminLayout title="Dashboard Users Management" requiredPage="access_control">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search dashboard users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {authState.role === DashboardRole.ADMIN && (
              <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-yulu-blue hover:bg-blue-700">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Dashboard User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Dashboard User</DialogTitle>
                    <DialogDescription>
                      Create a new user with access to Yulu Suvidha dashboard.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={newUser.name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={newUser.email}
                        onChange={handleInputChange}
                        placeholder="email@example.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={newUser.password}
                        onChange={handleInputChange}
                        placeholder="Password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value as DashboardRole }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={DashboardRole.ADMIN}>Admin</SelectItem>
                          <SelectItem value={DashboardRole.OPS_HEAD}>Ops Head</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddUserDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddDashboardUser}
                      disabled={isLoading}
                    >
                      {isLoading ? "Adding..." : "Add User"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Employee ID</TableHead>
                    {authState.role === DashboardRole.ADMIN && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === DashboardRole.ADMIN 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-green-100 text-green-800"
                          }`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>{user.employeeId}</TableCell>
                        {authState.role === DashboardRole.ADMIN && (
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={async (value) => {
                                try {
                                  setIsLoading(true);
                                  const success = await assignDashboardRole(
                                    user.id, 
                                    value as DashboardRole
                                  );
                                  
                                  if (success) {
                                    toast({
                                      title: "Success",
                                      description: "User role updated successfully",
                                    });
                                    fetchDashboardUsers();
                                  } else {
                                    toast({
                                      title: "Error",
                                      description: "Failed to update user role",
                                      variant: "destructive",
                                    });
                                  }
                                } catch (error) {
                                  console.error("Error updating user role:", error);
                                  toast({
                                    title: "Error",
                                    description: "An unexpected error occurred",
                                    variant: "destructive",
                                  });
                                } finally {
                                  setIsLoading(false);
                                }
                              }}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Change role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={DashboardRole.ADMIN}>Admin</SelectItem>
                                <SelectItem value={DashboardRole.OPS_HEAD}>Ops Head</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={authState.role === DashboardRole.ADMIN ? 5 : 4} className="text-center py-6">
                        No dashboard users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </AdminLayout>
    </RoleProtectedRoute>
  );
};

export default DashboardUsers;
