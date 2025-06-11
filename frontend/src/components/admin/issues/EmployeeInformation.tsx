
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Building, Calendar } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  cluster?: string;
  role?: string;
  employeeId?: string;
  dateOfJoining?: string;
}

interface EmployeeInformationProps {
  employee: Employee;
}

const EmployeeInformation: React.FC<EmployeeInformationProps> = ({ employee }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Employee Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-gray-600">{employee.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{employee.email}</p>
              </div>
            </div>
            
            {employee.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-gray-600">{employee.phone}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            {employee.employeeId && (
              <div className="flex items-center gap-3">
                <Badge variant="outline">ID: {employee.employeeId}</Badge>
              </div>
            )}
            
            {employee.city && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">City</p>
                  <p className="text-sm text-gray-600">{employee.city}</p>
                </div>
              </div>
            )}
            
            {employee.cluster && (
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Cluster</p>
                  <p className="text-sm text-gray-600">{employee.cluster}</p>
                </div>
              </div>
            )}
            
            {employee.role && (
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{employee.role}</Badge>
              </div>
            )}
            
            {employee.dateOfJoining && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Date of Joining</p>
                  <p className="text-sm text-gray-600">
                    {new Date(employee.dateOfJoining).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeInformation;
