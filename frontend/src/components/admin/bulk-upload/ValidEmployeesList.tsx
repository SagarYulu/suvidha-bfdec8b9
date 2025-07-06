
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface Employee {
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  city: string;
  cluster: string;
  manager?: string;
}

interface ValidEmployeesListProps {
  employees: Employee[];
  title?: string;
}

const ValidEmployeesList: React.FC<ValidEmployeesListProps> = ({
  employees,
  title = "Valid Employees"
}) => {
  if (employees.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {title} ({employees.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-64 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Cluster</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{employee.employeeId}</Badge>
                  </TableCell>
                  <TableCell>{employee.city}</TableCell>
                  <TableCell>{employee.cluster}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValidEmployeesList;
