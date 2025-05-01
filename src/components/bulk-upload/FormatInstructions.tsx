
import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon, CheckIcon } from "lucide-react";
import { ROLE_OPTIONS } from "@/data/formOptions";

const FormatInstructions = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start mb-4">
          <InfoIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <div>
            <h3 className="font-medium">CSV Format Instructions</h3>
            <p className="text-sm text-muted-foreground">
              Please ensure your CSV file follows these guidelines:
            </p>
          </div>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start">
            <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
            <div>
              <span className="font-medium">Required Fields:</span> User ID, emp_id, name, email, city, cluster, manager, role
            </div>
          </div>
          
          <div className="flex items-start">
            <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
            <div>
              <span className="font-medium">Date Format:</span> Use YYYY-MM-DD (e.g., 2023-01-15) or DD/MM/YYYY (e.g., 15/01/2023)
            </div>
          </div>
          
          <div className="flex items-start">
            <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
            <div>
              <span className="font-medium">User ID Format:</span> Must be a numeric value (e.g., 1234567)
            </div>
          </div>
          
          <div className="flex items-start">
            <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-medium">Roles:</span> 
              <span className="text-xs break-words">Must be one of: {ROLE_OPTIONS.join(', ')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormatInstructions;
