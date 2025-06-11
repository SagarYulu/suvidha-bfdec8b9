
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface EmptyDataStateProps {
  message?: string;
  description?: string;
  icon?: React.ReactNode;
}

const EmptyDataState: React.FC<EmptyDataStateProps> = ({ 
  message = "No data available", 
  description = "There is no data to display at this time.",
  icon
}) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        {icon || <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{message}</h3>
        <p className="text-sm text-gray-500 text-center max-w-sm">{description}</p>
      </CardContent>
    </Card>
  );
};

export default EmptyDataState;
