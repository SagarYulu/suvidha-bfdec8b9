
import React from 'react';
import { BarChart3 } from 'lucide-react';

interface EmptyDataStateProps {
  message?: string;
  icon?: React.ReactNode;
}

const EmptyDataState: React.FC<EmptyDataStateProps> = ({ 
  message = "No data available",
  icon 
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      {icon || <BarChart3 className="h-12 w-12 mb-4 text-gray-400" />}
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
};

export default EmptyDataState;
