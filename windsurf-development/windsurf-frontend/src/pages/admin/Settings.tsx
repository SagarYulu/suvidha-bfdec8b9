
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">System configuration options coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
