
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  validRows: any[];
  invalidRows: Array<{
    rowNumber: number;
    data: Record<string, string>;
    errors: string[];
  }>;
}

interface ValidationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  validationResult: ValidationResult | null;
  onProceed: () => void;
  onCancel: () => void;
}

const ValidationDialog: React.FC<ValidationDialogProps> = ({
  open,
  onOpenChange,
  validationResult,
  onProceed,
  onCancel
}) => {
  if (!validationResult) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Validation Results</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Valid Rows: {validationResult.validRows.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span>Invalid Rows: {validationResult.invalidRows.length}</span>
            </div>
          </div>

          {validationResult.invalidRows.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Issues Found:</h4>
              <ScrollArea className="h-48 border rounded-lg p-3">
                <div className="space-y-3">
                  {validationResult.invalidRows.map((row, index) => (
                    <div key={index} className="border-b pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="destructive">Row {row.rowNumber}</Badge>
                        <span className="text-sm text-gray-600">
                          {row.data.name || 'Unknown'}
                        </span>
                      </div>
                      <ul className="text-sm text-red-600 space-y-1">
                        {row.errors.map((error, errorIndex) => (
                          <li key={errorIndex}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {validationResult.validRows.length > 0 && (
            <Button onClick={onProceed}>
              Import {validationResult.validRows.length} Valid Records
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ValidationDialog;
