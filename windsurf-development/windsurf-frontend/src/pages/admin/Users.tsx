
import React, { useState } from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Filter, Users as UsersIcon } from "lucide-react";

const Users: React.FC = () => {
  const { hasPermission } = useRBAC();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  if (!hasPermission('manage_users')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to manage users.</p>
        </div>
      </div>
    );
  }

  // Mock user data
  const mockUsers = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@windsurf.com',
      role: 'admin',
      status: 'active',
      lastLogin: '2024-01-15 10:30 AM',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Manager User',
      email: 'manager@windsurf.com',
      role: 'manager',
      status: 'active',
      lastLogin: '2024-01-15 09:15 AM',
      createdAt: '2024-01-05'
    },
    {
      id: '3',
      name: 'Support Agent',
      email: 'support@windsurf.com',
      role: 'support',
      status: 'active',
      lastLogin: '2024-01-14 04:20 PM',
      createdAt: '2024-01-10'
    }
  ];

  const getRoleBadge = (role: string) => {
    const roleColors = {
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      support: 'bg-green-100 text-green-800',
      employee: 'bg-gray-100 text-gray-800'
    };
    return roleColors[role as keyof typeof roleColors] || roleColors.employee;
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.pending;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {mockUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <UsersIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span>Last login: {user.lastLogin}</span>
                      <span>Created: {user.createdAt}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex gap-2">
                    <Badge className={getRoleBadge(user.role)}>
                      {user.role.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusBadge(user.status)}>
                      {user.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Users;
