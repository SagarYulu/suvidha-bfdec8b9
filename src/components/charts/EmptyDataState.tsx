
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface EmptyDataStateProps {
  message?: string;
  subMessage?: string;
  icon?: React.ReactNode;
}

const EmptyDataState: React.FC<EmptyDataStateProps> = ({ 
  message = "No data available",
  subMessage = "There is no data to display for the selected criteria.",
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon || <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-500 max-w-md">{subMessage}</p>
    </div>
  );
};

export default EmptyDataState;
