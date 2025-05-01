
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { User } from "@/types";
import { DashboardRole, getDashboardUsers, createDashboardUser, createBulkDashboardUsers } from "@/services/dashboardRoleService";
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
import { Search, UserPlus, Plus, X, Check, Trash, Upload } from "lucide-react";
import BulkUserUpload from "@/components/BulkUserUpload";

// Type for our spreadsheet rows
interface SpreadsheetRow {
  id: string;
  name: string;
  email: string;
  role: DashboardRole;
  isNew?: boolean;
  isValid?: boolean;
}

const DashboardUsers = () => {
  const [dashboardUsers, setDashboardUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isSpreadsheetMode, setIsSpreadsheetMode] = useState(false);
  const [spreadsheetRows, setSpreadsheetRows] = useState<SpreadsheetRow[]>([]);
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
      const users = await getDashboardUsers();
      
      // Format users data to match User type
      const formattedUsers: User[] = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        employeeId: user.emp_id,
        role: user.role,
        // Add other required fields based on your User type
        phone: user.phone || '',
        city: user.city || '',
        cluster: user.cluster || '',
      }));
      
      setDashboardUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
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

  // Toggle spreadsheet mode and initialize with one empty row
  const toggleSpreadsheetMode = () => {
    setIsSpreadsheetMode(prev => {
      if (!prev) {
        // If turning on spreadsheet mode, add an initial empty row
        setSpreadsheetRows([{
          id: `row-${Date.now()}`,
          name: "",
          email: "",
          role: DashboardRole.OPS_HEAD,
          isNew: true
        }]);
      }
      return !prev;
    });
  };

  // Add a new empty row to the spreadsheet
  const addSpreadsheetRow = () => {
    setSpreadsheetRows(prev => [
      ...prev, 
      {
        id: `row-${Date.now()}`,
        name: "",
        email: "",
        role: DashboardRole.OPS_HEAD,
        isNew: true
      }
    ]);
  };

  // Handle changes to a spreadsheet row
  const handleSpreadsheetRowChange = (
    id: string, 
    field: keyof SpreadsheetRow, 
    value: string | DashboardRole
  ) => {
    setSpreadsheetRows(prev => 
      prev.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  // Remove a row from the spreadsheet
  const removeSpreadsheetRow = (id: string) => {
    setSpreadsheetRows(prev => prev.filter(row => row.id !== id));
  };

  // Validate all rows in the spreadsheet
  const validateSpreadsheetRows = () => {
    return setSpreadsheetRows(prev => 
      prev.map(row => ({
        ...row,
        isValid: !!row.name && !!row.email && !!row.role && validateEmail(row.email)
      }))
    );
  };

  // Email validation helper
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Save all valid rows from the spreadsheet
  const saveSpreadsheetRows = async () => {
    validateSpreadsheetRows();
    
    // Filter out valid rows
    const validRows = spreadsheetRows.filter(row => 
      row.name && row.email && row.role && validateEmail(row.email)
    );
    
    if (validRows.length === 0) {
      toast({
        title: "Validation Error",
        description: "No valid rows to save. Please check your entries.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await createBulkDashboardUsers(validRows.map(row => ({
        name: row.name,
        email: row.email,
        role: row.role,
        password: 'changeme123' // Default password
      })));
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Added ${result.count} new dashboard users`,
        });
        
        // Refresh the user list
        fetchDashboardUsers();
        
        // Clear spreadsheet mode and rows
        setIsSpreadsheetMode(false);
        setSpreadsheetRows([]);
      } else {
        toast({
          title: "Error",
          description: "Failed to add dashboard users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding dashboard users:", error);
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
    <RoleProtectedRoute page="dashboard_users" action="view">
      <AdminLayout title="Dashboard Users Management" requiredPage="dashboard_users">
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
            
            <div className="flex gap-3">
              {isSpreadsheetMode ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={toggleSpreadsheetMode}
                    className="flex items-center"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={saveSpreadsheetRows}
                    disabled={isLoading}
                    className="bg-yulu-blue hover:bg-blue-700 flex items-center"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Save Users
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={toggleSpreadsheetMode}
                    variant="outline" 
                    className="flex items-center"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Multiple Users
                  </Button>
                  
                  {authState.role === DashboardRole.ADMIN && (
                    <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-yulu-blue hover:bg-blue-700">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Single User
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
                                <SelectItem value={DashboardRole.SECURITY_MANAGER}>Security Manager</SelectItem>
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
                </>
              )}
            </div>
          </div>
          
          {isLoading && !isSpreadsheetMode ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
            </div>
          ) : isSpreadsheetMode ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spreadsheetRows.map((row, index) => (
                    <TableRow key={row.id} className={row.isValid === false ? "bg-red-50" : undefined}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={row.name}
                          onChange={(e) => handleSpreadsheetRowChange(row.id, 'name', e.target.value)}
                          placeholder="Full Name"
                          className={row.isValid === false && !row.name ? "border-red-500" : ""}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={row.email}
                          onChange={(e) => handleSpreadsheetRowChange(row.id, 'email', e.target.value)}
                          placeholder="email@example.com"
                          className={row.isValid === false && (!row.email || !validateEmail(row.email)) ? "border-red-500" : ""}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={row.role}
                          onValueChange={(value) => handleSpreadsheetRowChange(row.id, 'role', value as DashboardRole)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={DashboardRole.ADMIN}>Admin</SelectItem>
                            <SelectItem value={DashboardRole.OPS_HEAD}>Ops Head</SelectItem>
                            <SelectItem value={DashboardRole.SECURITY_MANAGER}>Security Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSpreadsheetRow(row.id)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Button
                        variant="ghost"
                        className="w-full flex items-center justify-center py-2 border border-dashed border-gray-300"
                        onClick={addSpreadsheetRow}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Row
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <>
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
                                : user.role === DashboardRole.SECURITY_MANAGER
                                ? "bg-purple-100 text-purple-800"
                                : "bg-green-100 text-green-800"
                            }`}>
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>{user.employeeId}</TableCell>
                          {authState.role === DashboardRole.ADMIN && (
                            <TableCell>
                              <Select
                                value={user.role as string}
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
                                  <SelectItem value={DashboardRole.SECURITY_MANAGER}>Security Manager</SelectItem>
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
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Bulk Upload</h3>
                <BulkUserUpload onUploadSuccess={fetchDashboardUsers} />
              </div>
            </>
          )}
        </div>
      </AdminLayout>
    </RoleProtectedRoute>
  );
};

export default DashboardUsers;
