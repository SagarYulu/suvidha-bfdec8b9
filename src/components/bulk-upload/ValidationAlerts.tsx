
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { ValidationResult } from "@/types";
import { ROLE_OPTIONS } from "@/data/formOptions";

interface ValidationAlertsProps {
  validationResults: ValidationResult;
}

const ValidationAlerts = ({ validationResults }: ValidationAlertsProps) => {
  const { invalidRows, validEmployees } = validationResults;

  // Always show validation status, even when there are no errors
  if (invalidRows.length > 0) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Validation Errors Found</AlertTitle>
        <AlertDescription>
          {invalidRows.length} row(s) contain validation errors and will be skipped.
          {validEmployees.length > 0 && 
            ` ${validEmployees.length} valid employee(s) can still be uploaded.`}
        </AlertDescription>
        
        {/* Display the first few error messages for better debugging */}
        <div className="mt-2 text-xs">
          <p className="font-medium">Some examples of errors:</p>
          <ul className="list-disc pl-5 mt-1">
            {invalidRows.slice(0, 3).map((row, idx) => (
              <li key={idx}>{row.errors[0]}</li>
            ))}
            {invalidRows.length > 3 && <li>... and more</li>}
          </ul>
          
          <p className="mt-2 font-medium">Available roles:</p>
          <p className="text-xs text-wrap break-words">{ROLE_OPTIONS.join(', ')}</p>
        </div>
      </Alert>
    );
  } 
  
  if (validEmployees.length > 0) {
    return (
      <Alert variant="default" className="mb-4 border-green-500 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-700">All Data Valid</AlertTitle>
        <AlertDescription className="text-green-700">
          {validEmployees.length} valid employee(s) ready to be uploaded.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (validEmployees.length === 0 && invalidRows.length === 0) {
    return (
      <Alert variant="default" className="mb-4 border-blue-500 bg-blue-50">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-700">No Data to Validate</AlertTitle>
        <AlertDescription className="text-blue-700">
          The CSV file appears to be empty or doesn't contain any recognizable employee data.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};

export default ValidationAlerts;
