import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { parseEmployeeCSV, getCSVTemplate } from "@/utils/csvHelpers";
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ROLE_OPTIONS, CITY_OPTIONS, CLUSTER_OPTIONS } from "@/data/formOptions";

const BulkUserUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationResults, setValidationResults] = useState<any>({ validEmployees: [], invalidRows: [] });
  const [editedRows, setEditedRows] = useState<Record<string, Record<string, string>>>({});
  const { toast } = useToast();

  // Helper function to get clusters for a city
  const getClustersForCity = (city: string) => {
    const matchedCity = CITY_OPTIONS.find(c => c.toLowerCase() === city.toLowerCase());
    return matchedCity ? CLUSTER_OPTIONS[matchedCity] : [];
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { validEmployees, invalidRows } = await parseEmployeeCSV(file);
      
      // Show validation dialog regardless of whether there are errors or not
      setValidationResults({ validEmployees, invalidRows });
      setEditedRows({}); // Reset any previous edits
      setShowValidationDialog(true);
      
      if (validEmployees.length === 0 && invalidRows.length === 0) {
        toast({
          variant: "destructive",
          title: "Empty File",
          description: "The CSV file doesn't contain any valid data rows.",
        });
      }
      
      setIsUploading(false);
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

  const handleFieldEdit = (rowIndex: string, field: string, value: string) => {
    setEditedRows(prev => ({
      ...prev,
      [rowIndex]: {
        ...(prev[rowIndex] || {}),
        [field]: value
      }
    }));
  };

  const getRowValue = (rowIndex: string, field: string, originalValue: string) => {
    return editedRows[rowIndex]?.[field] !== undefined 
      ? editedRows[rowIndex][field] 
      : originalValue;
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
      setShowValidationDialog(false);
    }
  };

  const handleProceedAnyway = () => {
    if (validationResults.validEmployees.length > 0) {
      uploadValidEmployees(validationResults.validEmployees);
    } else {
      toast({
        variant: "destructive",
        title: "No Valid Employees",
        description: "Cannot proceed as there are no valid employees to upload.",
      });
      setShowValidationDialog(false);
    }
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
          <li>Each city has specific valid clusters</li>
          <li>Dates should be in DD-MM-YYYY format</li>
          <li>Phone numbers should not include spaces or special characters</li>
          <li>Default password will be set as 'changeme123'</li>
          <li>Download the template for the correct format</li>
        </ul>
      </div>

      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>CSV Validation Results</DialogTitle>
          </DialogHeader>
          
          {validationResults.invalidRows.length > 0 ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Errors Found</AlertTitle>
              <AlertDescription>
                {validationResults.invalidRows.length} row(s) contain validation errors and will be skipped.
                {validationResults.validEmployees.length > 0 && 
                  ` ${validationResults.validEmployees.length} valid employee(s) can still be uploaded.`}
              </AlertDescription>
            </Alert>
          ) : validationResults.validEmployees.length > 0 ? (
            <Alert variant="default" className="mb-4 border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">All Data Valid</AlertTitle>
              <AlertDescription className="text-green-700">
                {validationResults.validEmployees.length} valid employee(s) ready to be uploaded.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Valid Data</AlertTitle>
              <AlertDescription>
                The CSV file doesn't contain any valid employee data rows.
              </AlertDescription>
            </Alert>
          )}
          
          <ScrollArea className="h-[50vh]">
            <div className="space-y-6">
              {validationResults.invalidRows.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Invalid Rows ({validationResults.invalidRows.length})</h3>
                  
                  <div className="space-y-4">
                    {validationResults.invalidRows.map((item: any, index: number) => (
                      <Card key={index} className="border-red-200">
                        <CardHeader className="bg-red-50 p-4 border-b border-red-200">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium text-red-800">Row {index + 1} - Validation Errors</h4>
                            <Badge variant="destructive" className="text-xs">{item.errors.length} Errors</Badge>
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-red-600 text-xs mt-2">
                            {item.errors.map((error: string, i: number) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        </CardHeader>
                        
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500">Employee ID</label>
                              <Input 
                                size="sm"
                                value={getRowValue(String(index), 'emp_id', item.rowData.emp_id)}
                                onChange={(e) => handleFieldEdit(String(index), 'emp_id', e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500">Name</label>
                              <Input 
                                size="sm"
                                value={getRowValue(String(index), 'name', item.rowData.name)}
                                onChange={(e) => handleFieldEdit(String(index), 'name', e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500">Email</label>
                              <Input 
                                size="sm"
                                value={getRowValue(String(index), 'email', item.rowData.email)}
                                onChange={(e) => handleFieldEdit(String(index), 'email', e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500">Phone</label>
                              <Input 
                                size="sm"
                                value={getRowValue(String(index), 'phone', item.rowData.phone)}
                                onChange={(e) => handleFieldEdit(String(index), 'phone', e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500">Role</label>
                              <Select
                                value={getRowValue(String(index), 'role', item.rowData.role)}
                                onValueChange={(value) => handleFieldEdit(String(index), 'role', value)}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROLE_OPTIONS.map(role => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500">City</label>
                              <Select
                                value={getRowValue(String(index), 'city', item.rowData.city)}
                                onValueChange={(value) => {
                                  handleFieldEdit(String(index), 'city', value);
                                  // Reset cluster when city changes
                                  handleFieldEdit(String(index), 'cluster', '');
                                }}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder="Select city" />
                                </SelectTrigger>
                                <SelectContent>
                                  {CITY_OPTIONS.map(city => (
                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500">Cluster</label>
                              <Select
                                value={getRowValue(String(index), 'cluster', item.rowData.cluster)}
                                onValueChange={(value) => handleFieldEdit(String(index), 'cluster', value)}
                                disabled={!getRowValue(String(index), 'city', item.rowData.city)}
                              >
                                <SelectTrigger className="h-8 text-sm">
                                  <SelectValue placeholder={!getRowValue(String(index), 'city', item.rowData.city) ? 
                                    "Select city first" : "Select cluster"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {getClustersForCity(getRowValue(String(index), 'city', item.rowData.city)).map(cluster => (
                                    <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500">Manager</label>
                              <Input 
                                size="sm"
                                value={getRowValue(String(index), 'manager', item.rowData.manager)}
                                onChange={(e) => handleFieldEdit(String(index), 'manager', e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500">Date of Joining (DD-MM-YYYY)</label>
                              <Input 
                                size="sm"
                                value={getRowValue(String(index), 'date_of_joining', item.rowData.date_of_joining)}
                                onChange={(e) => handleFieldEdit(String(index), 'date_of_joining', e.target.value)}
                                placeholder="DD-MM-YYYY"
                                className="h-8 text-sm"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500">Date of Birth (DD-MM-YYYY)</label>
                              <Input 
                                size="sm"
                                value={getRowValue(String(index), 'date_of_birth', item.rowData.date_of_birth)}
                                onChange={(e) => handleFieldEdit(String(index), 'date_of_birth', e.target.value)}
                                placeholder="DD-MM-YYYY"
                                className="h-8 text-sm"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500">Blood Group</label>
                              <Input 
                                size="sm"
                                value={getRowValue(String(index), 'blood_group', item.rowData.blood_group)}
                                onChange={(e) => handleFieldEdit(String(index), 'blood_group', e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500">Account Number</label>
                              <Input 
                                size="sm"
                                value={getRowValue(String(index), 'account_number', item.rowData.account_number)}
                                onChange={(e) => handleFieldEdit(String(index), 'account_number', e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-gray-500">IFSC Code</label>
                              <Input 
                                size="sm"
                                value={getRowValue(String(index), 'ifsc_code', item.rowData.ifsc_code)}
                                onChange={(e) => handleFieldEdit(String(index), 'ifsc_code', e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

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
                        <TableHead>Date of Joining</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResults.validEmployees.map((emp: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{emp.emp_id}</TableCell>
                          <TableCell>{emp.name}</TableCell>
                          <TableCell>{emp.email}</TableCell>
                          <TableCell>{emp.role}</TableCell>
                          <TableCell>{emp.city || '-'}</TableCell>
                          <TableCell>{emp.cluster || '-'}</TableCell>
                          <TableCell>{emp.date_of_joining || '-'}</TableCell>
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
            {validationResults.validEmployees.length > 0 ? (
              <Button onClick={handleProceedAnyway}>
                Upload Valid Employees ({validationResults.validEmployees.length})
              </Button>
            ) : (
              <Button variant="outline" disabled>
                No Valid Data to Upload
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulkUserUpload;
