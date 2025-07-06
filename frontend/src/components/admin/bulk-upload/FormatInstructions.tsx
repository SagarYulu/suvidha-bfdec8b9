
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertCircle } from 'lucide-react';

const FormatInstructions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          CSV Format Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Required Columns:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>name</strong> - Employee full name</li>
            <li>• <strong>email</strong> - Valid email address</li>
            <li>• <strong>phone</strong> - Phone number</li>
            <li>• <strong>employeeId</strong> - Unique employee ID</li>
            <li>• <strong>city</strong> - City location</li>
            <li>• <strong>cluster</strong> - Cluster assignment</li>
          </ul>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900 mb-2">Important Notes:</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Headers must match exactly (case-sensitive)</li>
                <li>• Email addresses must be unique</li>
                <li>• Employee IDs must be unique</li>
                <li>• Phone numbers should include country code</li>
                <li>• Maximum 1000 rows per upload</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Example Row:</h4>
          <div className="text-sm text-green-800 font-mono">
            John Doe, john.doe@company.com, +91-9876543210, EMP001, Mumbai, West
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormatInstructions;
