
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CompleteProjectBackup from '@/components/admin/CompleteProjectBackup';
import { Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ProjectBackup = () => {
  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center gap-4">
        <Link to="/admin/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Project Backup</h1>
          <p className="text-muted-foreground">Create a complete backup before migration</p>
        </div>
      </div>

      {/* Backup Component */}
      <CompleteProjectBackup />
      
      {/* Additional Information Card */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Package className="h-5 w-5" />
            Migration Ready
          </CardTitle>
          <CardDescription className="text-green-700">
            Once you've created your backup, you'll be ready to start the migration process
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-green-800">
          <div className="space-y-2">
            <p><strong>Next Steps After Backup:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Set up your standalone backend server</li>
              <li>Configure MySQL database with the schema</li>
              <li>Import your data using the backup files</li>
              <li>Update frontend to connect to new backend</li>
              <li>Test all functionality</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectBackup;
