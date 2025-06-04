
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Shield, UserPlus, Download } from "lucide-react";
import ExportControls from "@/components/admin/ExportControls";
import ValidationErrors from "@/components/ui/ValidationErrors";
import { apiService } from "@/services/api";
import { useErrorHandler } from "@/hooks/useErrorHandler";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showExportControls, setShowExportControls] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { handleError, handleSuccess } = useErrorHandler();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        apiService.getUsers(),
        apiService.getAllRoles()
      ]);
      setUsers(usersResponse.users || []);
      setRoles(rolesResponse.roles || []);
    } catch (error) {
      handleError(error, 'Fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      setValidationErrors([]);
      await apiService.assignRole(userId, roleId);
      fetchData();
      setShowRoleDialog(false);
      handleSuccess('Role assigned successfully');
    } catch (error) {
      if (error?.details) {
        setValidationErrors(error.details);
      } else {
        handleError(error, 'Assigning role');
      }
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      setValidationErrors([]);
      await apiService.removeRole(userId, roleId);
      fetchData();
      handleSuccess('Role removed successfully');
    } catch (error) {
      if (error?.details) {
        setValidationErrors(error.details);
      } else {
        handleError(error, 'Removing role');
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'security-admin':
        return 'bg-purple-100 text-purple-800';
      case 'agent':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          User Management
        </h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowExportControls(!showExportControls)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Users
          </Button>
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Export Controls */}
      {showExportControls && (
        <div className="mb-6">
          <ExportControls 
            entityType="users" 
            title="Export Users"
          />
        </div>
      )}

      {/* Validation Errors */}
      <ValidationErrors errors={validationErrors} className="mb-4" />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users & Roles</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.department || 'N/A'}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowRoleDialog(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Shield className="h-4 w-4" />
                      Manage Roles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Management Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Roles for {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          <ValidationErrors errors={validationErrors} className="mb-4" />
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Role</label>
              <Badge className={getRoleColor(selectedUser?.role || '')}>
                {selectedUser?.role}
              </Badge>
            </div>
            
            <div>
              <label className="text-sm font-medium">Assign New Role</label>
              <Select onValueChange={(roleId) => handleAssignRole(selectedUser?.id, roleId)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role: any) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowRoleDialog(false);
                  setValidationErrors([]);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
