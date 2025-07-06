
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
}

interface DashboardUserValidationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  validationResults: {
    valid: any[];
    errors: ValidationError[];
  };
  onProceed: (validData: any[]) => void;
}

const DashboardUserValidationDialog: React.FC<DashboardUserValidationDialogProps> = ({
  isOpen,
  onClose,
  validationResults,
  onProceed
}) => {
  const { valid, errors } = validationResults;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Validation Results
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Valid Records</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{valid.length}</p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium">Errors</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{errors.length}</p>
            </div>
          </div>

          {errors.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Validation Errors:</h4>
              <div className="max-h-64 overflow-y-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Row</th>
                      <th className="p-2 text-left">Field</th>
                      <th className="p-2 text-left">Value</th>
                      <th className="p-2 text-left">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map((error, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{error.row}</td>
                        <td className="p-2">{error.field}</td>
                        <td className="p-2 font-mono text-xs">{error.value}</td>
                        <td className="p-2 text-red-600">{error.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {valid.length > 0 && (
              <Button onClick={() => onProceed(valid)}>
                Proceed with {valid.length} Valid Records
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardUserValidationDialog;
