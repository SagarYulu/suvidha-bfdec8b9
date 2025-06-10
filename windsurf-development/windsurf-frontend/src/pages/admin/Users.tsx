
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Plus,
  Eye,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in real implementation, this would come from API
  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      employeeId: 'EMP001',
      role: 'Employee',
      status: 'active',
      department: 'IT',
      joinedDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      employeeId: 'EMP002',
      role: 'Manager',
      status: 'active',
      department: 'HR',
      joinedDate: '2024-01-10'
    },
    {
      id: 3,
      name: 'Admin User',
      email: 'admin@example.com',
      employeeId: 'ADM001',
      role: 'Admin',
      status: 'active',
      department: 'IT',
      joinedDate: '2024-01-01'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-purple-500';
      case 'Manager': return 'bg-blue-500';
      case 'Employee': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/admin/users/bulk-upload')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={() => navigate('/admin/users/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{user.name}</h4>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>ID: {user.employeeId}</span>
                    <span>Department: {user.department}</span>
                    <span>Joined: {user.joinedDate}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
