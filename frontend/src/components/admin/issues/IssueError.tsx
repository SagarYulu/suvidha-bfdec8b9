
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface IssueErrorProps {
  message?: string;
  onRetry?: () => void;
}

const IssueError: React.FC<IssueErrorProps> = ({
  message = "Failed to load issue details",
  onRetry
}) => {
  return (
    <Card className="border-red-200">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Issue</h3>
        <p className="text-red-600 mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default IssueError;
