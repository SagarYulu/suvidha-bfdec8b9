
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ValidationErrorsProps {
  errors: string[] | string;
  className?: string;
}

const ValidationErrors: React.FC<ValidationErrorsProps> = ({ errors, className = "" }) => {
  if (!errors || (Array.isArray(errors) && errors.length === 0)) {
    return null;
  }

  const errorList = Array.isArray(errors) ? errors : [errors];

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {errorList.length === 1 ? (
          <span>{errorList[0]}</span>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {errorList.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ValidationErrors;
