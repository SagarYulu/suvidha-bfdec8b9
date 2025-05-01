
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { DashboardRole, createDashboardUser } from "@/services/dashboardRoleService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddUserForm = ({ onSuccess, onCancel }: AddUserFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: DashboardRole.OPS_HEAD
  });

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
        
        // Notify parent component
        onSuccess();
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

      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={onCancel}
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
    </div>
  );
};

export default AddUserForm;
