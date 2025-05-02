
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MobileIssues = () => {
  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Issues List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No issues found. This page serves as a placeholder since you've requested
            to remove duplicate mobile issue pages.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileIssues;
