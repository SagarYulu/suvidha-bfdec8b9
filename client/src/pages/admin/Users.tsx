import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getUsers, createUser, deleteUser } from "@/services/userService";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Trash, UserPlus, RefreshCw, AlertCircle } from "lucide-react";
import BulkUserUpload from "@/components/BulkUserUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROLE_OPTIONS, CITY_OPTIONS, CLUSTER_OPTIONS } from "@/data/formOptions";

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [availableClusters, setAvailableClusters] = useState<string[]>([]);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(Date.now());

  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    userId: "",
    name: "",
    email: "",
    phone: "",
    employeeId: "",
    city: "",
    cluster: "",
    manager: "",
    role: "",
    password: "",
    dateOfJoining: "",
    bloodGroup: "",
    dateOfBirth: "",
    accountNumber: "",
    ifscCode: ""
  });

  // Update clusters when city changes
  useEffect(() => {
    if (newUser.city && CLUSTER_OPTIONS[newUser.city]) {
      setAvailableClusters(CLUSTER_OPTIONS[newUser.city]);
      // Reset cluster if it doesn't belong to the new city
      if (newUser.cluster && !CLUSTER_OPTIONS[newUser.city].includes(newUser.cluster)) {
        setNewUser(prev => ({ ...prev, cluster: "" }));
      }
    } else {
      setAvailableClusters([]);
    }
  }, [newUser.city]);

  const fetchUsers = useCallback(async () => {
    console.log(`Fetching users at ${new Date().toISOString()}...`);
    setIsLoading(true);
    try {
      // Force a complete refresh from server
      const fetchedUsers = await getUsers();
      console.log(`Fetched ${fetchedUsers?.length || 0} users:`, fetchedUsers);
      
      if (Array.isArray(fetchedUsers)) {
        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
        console.log(`Updated users state with ${fetchedUsers.length} users at ${new Date().toISOString()}`);
        
        // Display a message if users were fetched successfully but no data was returned
        if (fetchedUsers.length === 0) {
          toast({
            title: "No users found",
            description: "No users were found in the database. Try adding a new user.",
            variant: "default",
          });
        }
      } else {
        console.error("Fetched users is not an array:", fetchedUsers);
        toast({
          title: "Error",
          description: "Failed to fetch users: Invalid data format",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Please check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLastRefreshedAt(Date.now());
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    console.log("Initial users fetch");
    fetchUsers();
  }, [fetchUsers]);

  // Filter users when searchTerm changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter((user) => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          user.name.toLowerCase().includes(searchTermLower) ||
          user.email.toLowerCase().includes(searchTermLower) ||
          user.employeeId.toLowerCase().includes(searchTermLower) ||
          (user.city && user.city.toLowerCase().includes(searchTermLower))
        );
      });
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.phone || !newUser.employeeId || !newUser.password || !newUser.role || !newUser.userId) {
      toast({
        title: "Validation error",
        description: "Please fill out all required fields including User ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const createdUser = await createUser(newUser);
      setUsers(prevUsers => [...prevUsers, createdUser]);
      setFilteredUsers(prevUsers => [...prevUsers, createdUser]);
      setIsAddUserDialogOpen(false);
      
      setNewUser({
        userId: "",
        name: "",
        email: "",
        phone: "",
        employeeId: "",
        city: "",
        cluster: "",
        manager: "",
        role: "",
        password: "",
        dateOfJoining: "",
        bloodGroup: "",
        dateOfBirth: "",
        accountNumber: "",
        ifscCode: ""
      });
      
      toast({
        title: "Success",
        description: "User added successfully",
      });
      
      // Refresh the user list to show the new user
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId);
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        setFilteredUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  // Handle successful bulk upload with proper logging
  const handleBulkUploadSuccess = useCallback(() => {
    console.log("Bulk upload successful, refreshing users list...");
    // Close the dialog and refresh the user list
    setIsAddUserDialogOpen(false);
    
    // Add a small delay to ensure the database has finished processing
    toast({
      title: "Success",
      description: "Users uploaded successfully. Refreshing user list...",
    });
    
    // Give the database a moment to complete the transaction
    setTimeout(() => {
      fetchUsers();
    }, 2000); // Increased delay further to ensure database consistency
  }, [fetchUsers]);

  const handleManualRefresh = () => {
    toast({
      title: "Refreshing",
      description: "Fetching latest user data...",
    });
    fetchUsers();
  };

  // Debug: Force initial fetch on component mount
  useEffect(() => {
    // Short timeout to ensure component is fully mounted
    const timer = setTimeout(() => {
      console.log("Force initial data fetch after mount");
      fetchUsers();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  console.log(`Users component render at ${new Date().toISOString()} with ${users.length} users and ${filteredUsers.length} filtered users. Last refreshed: ${new Date(lastRefreshedAt).toLocaleTimeString()}`);

  return (
    <AdminLayout title="Users Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleManualRefresh} 
              variant="outline" 
              className="flex items-center"
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Refreshing..." : "Refresh Users"}
            </Button>
            
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-yulu-blue hover:bg-blue-700">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="manual" className="w-full">
                  <TabsList className="mb-4 grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
                  </TabsList>
                  <TabsContent value="manual">
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="userId">User ID *</Label>
                          <Input
                            id="userId"
                            name="userId"
                            value={newUser.userId}
                            onChange={handleInputChange}
                            placeholder="Numeric User ID (e.g. 1001)"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employeeId">Employee ID *</Label>
                          <Input
                            id="employeeId"
                            name="employeeId"
                            value={newUser.employeeId}
                            onChange={handleInputChange}
                            placeholder="Employee ID (e.g. YL001)"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            value={newUser.name}
                            onChange={handleInputChange}
                            placeholder="Full Name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={newUser.email}
                            onChange={handleInputChange}
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={newUser.phone}
                            onChange={handleInputChange}
                            placeholder="9876543210"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Select
                            value={newUser.city}
                            onValueChange={(value) => setNewUser({ ...newUser, city: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                              {CITY_OPTIONS.map(city => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cluster">Cluster</Label>
                          <Select
                            value={newUser.cluster}
                            onValueChange={(value) => setNewUser({ ...newUser, cluster: value })}
                            disabled={!newUser.city || availableClusters.length === 0}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={!newUser.city ? "Select a city first" : "Select cluster"} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableClusters.map(cluster => (
                                <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="manager">Manager</Label>
                          <Input
                            id="manager"
                            name="manager"
                            value={newUser.manager}
                            onChange={handleInputChange}
                            placeholder="Manager name"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="role">Role *</Label>
                          <Select
                            value={newUser.role}
                            onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map(role => (
                                <SelectItem key={role} value={role}>{role}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dateOfJoining">Date of Joining</Label>
                          <Input
                            id="dateOfJoining"
                            name="dateOfJoining"
                            type="date"
                            value={newUser.dateOfJoining}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            value={newUser.dateOfBirth}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bloodGroup">Blood Group</Label>
                          <Input
                            id="bloodGroup"
                            name="bloodGroup"
                            value={newUser.bloodGroup}
                            onChange={handleInputChange}
                            placeholder="A+, B-, O+, etc."
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="accountNumber">Account Number</Label>
                          <Input
                            id="accountNumber"
                            name="accountNumber"
                            value={newUser.accountNumber}
                            onChange={handleInputChange}
                            placeholder="Account Number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ifscCode">IFSC Code</Label>
                          <Input
                            id="ifscCode"
                            name="ifscCode"
                            value={newUser.ifscCode}
                            onChange={handleInputChange}
                            placeholder="IFSC Code"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={newUser.password}
                          onChange={handleInputChange}
                          placeholder="Password"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        className="bg-yulu-blue hover:bg-blue-700" 
                        onClick={handleAddUser}
                        disabled={isLoading}
                      >
                        {isLoading ? "Adding..." : "Add User"}
                      </Button>
                    </DialogFooter>
                  </TabsContent>
                  <TabsContent value="bulk">
                    <BulkUserUpload onUploadSuccess={handleBulkUploadSuccess} />
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border rounded-lg">
            <div className="mb-4">
              {users.length === 0 ? (
                <UserPlus className="h-12 w-12 mx-auto text-gray-400" />
              ) : (
                <AlertCircle className="h-12 w-12 mx-auto text-yellow-400" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first user or check database connection
            </p>
            <div className="mt-4 flex justify-center space-x-2">
              <Button 
                onClick={handleManualRefresh}
                variant="outline" 
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-yulu-blue hover:bg-blue-700">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                  </DialogHeader>
                  <p className="text-muted-foreground">
                    Please use the "Add User" button in the top navigation to add users.
                  </p>
                  <DialogFooter>
                    <Button onClick={() => setIsAddUserDialogOpen(true)}>
                      Go to Add User
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg max-w-lg mx-auto">
              <p className="text-sm font-medium text-yellow-700">Troubleshooting Tips:</p>
              <ul className="mt-2 text-sm text-yellow-600 list-disc pl-5 space-y-1">
                <li>Check that Supabase connection is working</li>
                <li>Verify 'employees' table exists and has data</li>
                <li>Check console logs for errors</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>UUID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Cluster</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.userId}</TableCell>
                      <TableCell>{user.employeeId}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.city}</TableCell>
                      <TableCell>{user.cluster}</TableCell>
                      <TableCell>{user.manager}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === "Admin" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-500"
                          onClick={() => user.id && handleDeleteUser(user.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-6">
                      No matching users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Debug information */}
        <div className="text-xs text-gray-400 mt-2 flex justify-between">
          <span>Last refreshed: {new Date(lastRefreshedAt).toLocaleTimeString()}</span>
          <span>Database connection: Active</span>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
