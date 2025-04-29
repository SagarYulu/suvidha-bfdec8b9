
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { parseEmployeeCSV, getCSVTemplate } from "@/utils/csvHelpers";
import { Download, Upload, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

const BulkUserUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationResults, setValidationResults] = useState<any>({ validEmployees: [], invalidRows: [] });
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { validEmployees, invalidRows } = await parseEmployeeCSV(file);
      
      if (invalidRows.length > 0) {
        // Show validation dialog with errors
        setValidationResults({ validEmployees, invalidRows });
        setShowValidationDialog(true);
        setIsUploading(false);
        return;
      }
      
      if (validEmployees.length === 0) {
        toast({
          variant: "destructive",
          title: "No Valid Employees",
          description: "The CSV file doesn't contain any valid employee data.",
        });
        setIsUploading(false);
        return;
      }

      // Continue with upload of valid employees only
      await uploadValidEmployees(validEmployees);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "There was an error processing the CSV file. Please check the format.",
      });
      setIsUploading(false);
    } finally {
      if (event.target) event.target.value = '';
    }
  };

  const uploadValidEmployees = async (employees: any[]) => {
    try {
      // Map CSV fields to employees table structure
      const employeesData = employees.map(emp => ({
        name: emp.name,
        email: emp.email,
        phone: emp.phone || null,
        emp_id: emp.emp_id,
        city: emp.city || null,
        cluster: emp.cluster || null,
        role: emp.role || 'Employee',
        password: emp.password || 'changeme123',
        date_of_joining: emp.date_of_joining || null,
        date_of_birth: emp.date_of_birth || null,
        blood_group: emp.blood_group || null,
        account_number: emp.account_number || null,
        ifsc_code: emp.ifsc_code || null,
        manager: emp.manager || null,
      }));
      
      // Insert employees into Supabase
      const { error } = await supabase
        .from('employees')
        .insert(employeesData);

      if (error) throw error;

      toast({
        title: "Upload Successful",
        description: `Successfully added ${employees.length} employees.`,
      });
    } catch (error: any) {
      console.error('Upload to database error:', error);
      toast({
        variant: "destructive",
        title: "Database Upload Failed",
        description: error.message || "There was an error uploading to the database.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProceedAnyway = () => {
    if (validationResults.validEmployees.length > 0) {
      uploadValidEmployees(validationResults.validEmployees);
    }
    setShowValidationDialog(false);
  };

  const downloadTemplate = () => {
    const blob = new Blob([getCSVTemplate()], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>
        
        <div className="relative">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button
            variant="default"
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload CSV"}
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p className="font-medium mb-2">CSV Format Instructions:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Required fields: Employee ID (emp_id), Name, Email, Role</li>
          <li>Valid roles include: Mechanic, Pilot, Marshal, Zone Screener, etc.</li>
          <li>Valid cities: Bangalore, Delhi, Mumbai</li>
          <li>Dates should be in YYYY-MM-DD format</li>
          <li>Phone numbers should not include spaces or special characters</li>
          <li>Default password will be set as 'changeme123'</li>
          <li>Download the template for the correct format</li>
        </ul>
      </div>

      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>CSV Validation Results</DialogTitle>
          </DialogHeader>
          
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Errors Found</AlertTitle>
            <AlertDescription>
              {validationResults.invalidRows.length} row(s) contain validation errors and will be skipped.
              {validationResults.validEmployees.length > 0 && 
                ` ${validationResults.validEmployees.length} valid employee(s) can still be uploaded.`}
            </AlertDescription>
          </Alert>
          
          <ScrollArea className="h-[50vh]">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Invalid Rows ({validationResults.invalidRows.length})</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row Data</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResults.invalidRows.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="align-top">
                          <div className="text-xs">
                            {Object.entries(item.row).map(([key, value]) => (
                              <div key={key}><span className="font-semibold">{key}:</span> {String(value)}</div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <ul className="text-xs text-red-500 list-disc list-inside">
                            {item.errors.map((error: string, i: number) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {validationResults.validEmployees.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium">Valid Employees ({validationResults.validEmployees.length})</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    These employees will be added if you proceed.
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Cluster</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResults.validEmployees.map((emp: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{emp.emp_id}</TableCell>
                          <TableCell>{emp.name}</TableCell>
                          <TableCell>{emp.email}</TableCell>
                          <TableCell>{emp.role}</TableCell>
                          <TableCell>{emp.city}</TableCell>
                          <TableCell>{emp.cluster}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowValidationDialog(false)}>
              Cancel Upload
            </Button>
            {validationResults.validEmployees.length > 0 && (
              <Button onClick={handleProceedAnyway}>
                Upload Valid Employees ({validationResults.validEmployees.length})
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulkUserUpload;
