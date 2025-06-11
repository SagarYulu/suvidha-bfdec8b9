
import React from 'react';
import { FileX, TrendingDown } from 'lucide-react';

interface EmptyDataStateProps {
  message?: string;
  subMessage?: string;
  icon?: React.ReactNode;
  className?: string;
}

const EmptyDataState: React.FC<EmptyDataStateProps> = ({
  message = "No data available",
  subMessage,
  icon,
  className = ""
}) => {
  const defaultIcon = <FileX className="h-12 w-12 text-gray-400" />;

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {icon || defaultIcon}
      <h3 className="mt-4 text-lg font-medium text-gray-900">{message}</h3>
      {subMessage && (
        <p className="mt-2 text-sm text-gray-500">{subMessage}</p>
      )}
    </div>
  );
};

export default EmptyDataState;
