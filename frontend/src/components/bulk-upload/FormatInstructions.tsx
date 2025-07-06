
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormatInstructionsProps {
  onDownloadTemplate?: () => void;
}

const FormatInstructions: React.FC<FormatInstructionsProps> = ({
  onDownloadTemplate
}) => {
  const requiredColumns = [
    { name: 'userId', description: 'Unique identifier for the user', example: 'YUL001' },
    { name: 'name', description: 'Full name of the user', example: 'John Doe' },
    { name: 'email', description: 'Valid email address', example: 'john.doe@yulu.bike' },
    { name: 'employee_id', description: 'Employee ID (optional)', example: 'EMP001' },
    { name: 'phone', description: 'Phone number (optional)', example: '+919876543210' },
    { name: 'city', description: 'City name', example: 'Bangalore' },
    { name: 'cluster', description: 'Cluster within the city', example: 'North' },
    { name: 'role', description: 'User role', example: 'DE' }
  ];

  const validRoles = ['DE', 'FM', 'AM', 'City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 'Payroll Ops', 'HR Admin'];
  const validCities = ['Bangalore', 'Delhi', 'Mumbai', 'Pune'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          CSV Format Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Please ensure your CSV file follows the format below. Download the template for a properly formatted file.
          </AlertDescription>
        </Alert>

        {onDownloadTemplate && (
          <Button onClick={onDownloadTemplate} className="w-full mb-4">
            <Download className="h-4 w-4 mr-2" />
            Download CSV Template
          </Button>
        )}

        <div className="space-y-4">
          <h4 className="font-medium">Required Columns:</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-2 text-left">Column Name</th>
                  <th className="border border-gray-200 p-2 text-left">Description</th>
                  <th className="border border-gray-200 p-2 text-left">Example</th>
                </tr>
              </thead>
              <tbody>
                {requiredColumns.map((col, index) => (
                  <tr key={index}>
                    <td className="border border-gray-200 p-2 font-mono">{col.name}</td>
                    <td className="border border-gray-200 p-2">{col.description}</td>
                    <td className="border border-gray-200 p-2 text-gray-600">{col.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Valid Roles:</h4>
              <div className="flex flex-wrap gap-1">
                {validRoles.map((role, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Valid Cities:</h4>
              <div className="flex flex-wrap gap-1">
                {validCities.map((city, index) => (
                  <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Important Notes:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Ensure all required fields (userId, name, email, city, role) are filled</li>
                <li>Email addresses must be unique across all users</li>
                <li>UserIds must be unique and follow the format YUL001, YUL002, etc.</li>
                <li>Phone numbers should include country code (+91 for India)</li>
                <li>Cluster values depend on the selected city</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormatInstructions;
