
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

const TemplateControls: React.FC = () => {
  const downloadTemplate = () => {
    const headers = ['name', 'email', 'phone', 'employeeId', 'city', 'cluster', 'manager'];
    const csvContent = headers.join(',');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee_upload_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const downloadSampleData = () => {
    const headers = ['name', 'email', 'phone', 'employeeId', 'city', 'cluster', 'manager'];
    const sampleRows = [
      ['John Doe', 'john.doe@company.com', '+91-9876543210', 'EMP001', 'Mumbai', 'West', 'Jane Smith'],
      ['Alice Johnson', 'alice.johnson@company.com', '+91-9876543211', 'EMP002', 'Delhi', 'North', 'Bob Brown'],
      ['Michael Chen', 'michael.chen@company.com', '+91-9876543212', 'EMP003', 'Bangalore', 'South', 'Carol White']
    ];
    
    const csvContent = [headers.join(','), ...sampleRows.map(row => row.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee_sample_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Template & Samples
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">CSV Template</h4>
          <p className="text-sm text-gray-600 mb-3">
            Download an empty template with the correct column headers.
          </p>
          <Button onClick={downloadTemplate} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Sample Data</h4>
          <p className="text-sm text-gray-600 mb-3">
            Download a template with sample data to see the expected format.
          </p>
          <Button onClick={downloadSampleData} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Sample
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateControls;
