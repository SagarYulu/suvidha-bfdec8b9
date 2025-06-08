
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    employeeId: '',
    city: '',
    cluster: '',
    reportingManager: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // API call to create user
      console.log('Creating user:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate back to users list
      navigate('/admin/users');
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const roles = [
    'Employee',
    'Team Lead',
    'Manager',
    'HR',
    'Admin'
  ];

  const departments = [
    'Engineering',
    'Operations',
    'Human Resources',
    'Finance',
    'Marketing',
    'Sales'
  ];

  const cities = [
    'Bangalore',
    'Mumbai',
    'Delhi',
    'Chennai',
    'Hyderabad',
    'Pune'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/users')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <h1 className="text-3xl font-bold flex items-center">
          <User className="h-8 w-8 mr-3 text-blue-600" />
          Add New User
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee ID *</label>
                <Input
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  placeholder="Enter employee ID"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  required
                >
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department *</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  required
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <div className="relative">
                  <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <select 
                    className="w-full p-2 pl-8 border rounded-md"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  >
                    <option value="">Select city</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cluster</label>
                <Input
                  value={formData.cluster}
                  onChange={(e) => handleInputChange('cluster', e.target.value)}
                  placeholder="Enter cluster"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reporting Manager</label>
                <Input
                  value={formData.reportingManager}
                  onChange={(e) => handleInputChange('reportingManager', e.target.value)}
                  placeholder="Enter reporting manager"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center space-x-4 pt-6">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Creating User...' : 'Create User'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/admin/users')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddUser;
