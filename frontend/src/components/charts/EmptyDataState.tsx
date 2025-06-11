
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EmptyDataStateProps {
  message?: string;
  subMessage?: string;
  icon?: React.ReactNode;
}

const EmptyDataState: React.FC<EmptyDataStateProps> = ({
  message = "No data available",
  subMessage,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      {icon || <AlertCircle className="h-12 w-12 mb-4 text-gray-400" />}
      <h3 className="text-lg font-medium mb-2">{message}</h3>
      {subMessage && (
        <p className="text-sm text-center max-w-sm">{subMessage}</p>
      )}
    </div>
  );
};

export default EmptyDataState;
