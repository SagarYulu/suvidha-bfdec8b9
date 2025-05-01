import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { parseEmployeeCSV } from "@/utils/csvParserUtils";
import { validateEmployeeData } from "@/utils/validationUtils";
import { ValidationResult, CSVEmployeeData, EditedRowsRecord, RowData } from "@/types";
import { ROLE_OPTIONS } from "@/data/formOptions";
import { createBulkDashboardUsers } from "@/services/dashboardRoleService";

export const useBulkUpload = (onUploadSuccess?: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult>({ 
    validEmployees: [], 
    invalidRows: [] 
  });
  const [editedRows, setEditedRows] = useState<EditedRowsRecord>({});
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      console.log("[useBulkUpload] Starting CSV upload and validation for file:", file.name);
      
      // Always reset the validation state before new validation
      setValidationResults({ validEmployees: [], invalidRows: [] });
      setEditedRows({});
      
      const result = await parseEmployeeCSV(file);
      
      console.log("[useBulkUpload] CSV parsing complete, validation results:", result);
      
      // Set validation results first
      setValidationResults(result);
      
      // Initialize edited rows with original data
      const initialEditedRows: EditedRowsRecord = {};
      result.invalidRows.forEach((item, index) => {
        initialEditedRows[`row-${index}`] = { ...item.rowData };
      });
      setEditedRows(initialEditedRows);
      
      // After setting results, force dialog to show regardless of result
      console.log("[useBulkUpload] Setting showValidationDialog to true");
      setShowValidationDialog(true);
      
      if (result.validEmployees.length === 0 && result.invalidRows.length === 0) {
        toast({
          variant: "destructive",
          title: "Empty File",
          description: "The CSV file doesn't contain any valid data rows.",
        });
      } else if (result.invalidRows.length > 0) {
        toast({
          variant: "destructive",
          title: "Validation Issues Found",
          description: `${result.invalidRows.length} rows contain validation errors. Please review and fix them.`,
        });
      } else if (result.validEmployees.length > 0) {
        toast({
          title: "Validation Successful",
          description: `${result.validEmployees.length} valid employee(s) ready to be uploaded.`,
        });
      }
      
    } catch (error) {
      console.error('[useBulkUpload] Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "There was an error processing the CSV file. Please check the format.",
      });
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleFieldEdit = (rowKey: string, field: keyof RowData, value: string) => {
    setEditedRows(prev => ({
      ...prev,
      [rowKey]: {
        ...prev[rowKey],
        [field]: value
      }
    }));
  };

  // Check if all edited rows are now valid
  const validateEditedRows = () => {
    const correctedEmployees: CSVEmployeeData[] = [];
    const stillInvalid: {row: CSVEmployeeData, errors: string[], rowData: RowData}[] = [];
    
    // Process each invalid row with its edits
    validationResults.invalidRows.forEach((item, index) => {
      const rowKey = `row-${index}`;
      const editedRow = editedRows[rowKey] || item.rowData;
      
      // Convert the edited row data to the employee data format
      const employeeData: Partial<CSVEmployeeData> = {
        userId: editedRow.userId || '',
        emp_id: editedRow.emp_id || '',
        name: editedRow.name || '',
        email: editedRow.email || '',
        phone: editedRow.phone || null,
        city: editedRow.city || null,
        cluster: editedRow.cluster || null,
        role: editedRow.role || '',
        manager: editedRow.manager || null,
        password: editedRow.password || 'changeme123',
        date_of_joining: editedRow.date_of_joining || null,
        date_of_birth: editedRow.date_of_birth || null,
        blood_group: editedRow.blood_group || null,
        account_number: editedRow.account_number || null,
        ifsc_code: editedRow.ifsc_code || null
      };
      
      console.log("Validating edited row:", employeeData);
      
      // Validate the edited data
      const validation = validateEmployeeData({
        ...employeeData,
        user_id: employeeData.userId // Map userId to user_id for validation
      });
      
      if (validation.isValid) {
        correctedEmployees.push({
          ...employeeData as CSVEmployeeData,
          password: employeeData.password || 'changeme123' // Ensure password is set
        });
      } else {
        stillInvalid.push({
          row: {
            ...employeeData as CSVEmployeeData
          }, 
          errors: validation.errors,
          rowData: editedRow
        });
      }
    });
    
    return { correctedEmployees, stillInvalid };
  };

  const handleUploadEditedRows = async () => {
    // First validate all edited rows
    const { correctedEmployees, stillInvalid } = validateEditedRows();
    
    if (stillInvalid.length > 0) {
      // Some rows are still invalid
      toast({
        variant: "destructive",
        title: "Validation Errors",
        description: `${stillInvalid.length} row(s) still have validation errors. Please correct them before uploading.`,
      });
      
      // Update validation results with the still invalid rows
      setValidationResults(prev => ({
        ...prev,
        invalidRows: stillInvalid
      }));
      
      return;
    }
    
    // Combine the original valid employees with the corrected ones
    const allEmployees = [...validationResults.validEmployees, ...correctedEmployees];
    uploadValidEmployees(allEmployees);
  };

  const uploadValidEmployees = async (employees: CSVEmployeeData[]) => {
    try {
      setIsUploading(true);
      
      // First check for duplicate emp_ids in the database
      const empIdsToCheck = employees.map(emp => emp.emp_id);
      
      // Check for existing employee IDs to avoid constraint violations
      const { data: existingEmps, error: checkError } = await supabase
        .from('dashboard_users')
        .select('emp_id')
        .in('emp_id', empIdsToCheck);
      
      if (checkError) {
        console.error('[useBulkUpload] Error checking existing employee IDs:', checkError);
        throw new Error('Failed to check for existing employees');
      }
      
      // Extract the list of existing employee IDs
      const existingEmpIds = existingEmps?.map(emp => emp.emp_id) || [];
      
      // Filter out employees with duplicate emp_ids
      const newEmployees = employees.filter(emp => !existingEmpIds.includes(emp.emp_id));
      const duplicateEmployees = employees.filter(emp => existingEmpIds.includes(emp.emp_id));
      
      if (newEmployees.length === 0) {
        toast({
          variant: "destructive",
          title: "No New Employees",
          description: `All ${employees.length} employees already exist in the database with the same Employee IDs.`,
        });
        setIsUploading(false);
        setShowValidationDialog(false);
        return;
      }
      
      // Use the bulk dashboard users creation from our service
      const result = await createBulkDashboardUsers(newEmployees);
      
      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Database Upload Failed",
          description: "There was an error uploading to the database.",
        });
        throw new Error("Failed to create bulk dashboard users");
      }
      
      const duplicateMessage = duplicateEmployees.length > 0 
        ? ` (${duplicateEmployees.length} duplicate employee IDs were skipped)`
        : '';
      
      toast({
        title: "Upload Successful",
        description: `Successfully added ${newEmployees.length} employees.${duplicateMessage}`,
      });
      
      // Call the onUploadSuccess callback if provided
      if (onUploadSuccess) {
        console.log("[useBulkUpload] Calling onUploadSuccess callback to refresh user list");
        onUploadSuccess();
      }
      
      // Only NOW close the dialog after successful upload
      setShowValidationDialog(false);
    } catch (error: any) {
      console.error('[useBulkUpload] Upload to database error:', error);
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
    } else {
      toast({
        variant: "destructive",
        title: "No Valid Employees",
        description: "Cannot proceed as there are no valid employees to upload.",
      });
      setShowValidationDialog(false);
    }
  };

  return {
    isUploading,
    showValidationDialog,
    setShowValidationDialog,
    validationResults,
    editedRows,
    handleFileUpload,
    handleFieldEdit,
    handleUploadEditedRows,
    handleProceedAnyway
  };
};

export default useBulkUpload;
