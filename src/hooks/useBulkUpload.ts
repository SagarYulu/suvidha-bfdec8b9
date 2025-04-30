
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { parseEmployeeCSV } from "@/utils/csvParserUtils";
import { validateEmployeeData } from "@/utils/validationUtils";
import { formatDateToYYYYMMDD } from "@/utils/dateUtils";
import { ValidationResult, CSVEmployeeData, EditedRowsRecord, RowData } from "@/types";

export const useBulkUpload = () => {
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
      const result = await parseEmployeeCSV(file);
      
      setValidationResults(result);
      // Initialize edited rows with original data
      const initialEditedRows: EditedRowsRecord = {};
      result.invalidRows.forEach((item, index) => {
        initialEditedRows[`row-${index}`] = { ...item.rowData };
      });
      setEditedRows(initialEditedRows);
      
      setShowValidationDialog(true);
      
      if (result.validEmployees.length === 0 && result.invalidRows.length === 0) {
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
        id: editedRow.id || '',
        userId: editedRow.userId || '',
        emp_id: editedRow.emp_id || '',
        name: editedRow.name || '',
        email: editedRow.email || '',
        phone: editedRow.phone || null,
        city: editedRow.city || null,
        cluster: editedRow.cluster || null,
        role: editedRow.role || '',
        manager: editedRow.manager || null,
        date_of_joining: editedRow.date_of_joining || null,
        date_of_birth: editedRow.date_of_birth || null,
        blood_group: editedRow.blood_group || null,
        account_number: editedRow.account_number || null,
        ifsc_code: editedRow.ifsc_code || null,
        password: editedRow.password || 'changeme123',
      };
      
      // Validate the edited data
      const validation = validateEmployeeData({
        ...employeeData,
        user_id: employeeData.userId // Map to the field name expected by validation
      });
      
      if (validation.isValid) {
        correctedEmployees.push({
          ...employeeData as CSVEmployeeData,
          date_of_joining: formatDateToYYYYMMDD(employeeData.date_of_joining),
          date_of_birth: formatDateToYYYYMMDD(employeeData.date_of_birth),
          password: employeeData.password || 'changeme123'
        });
      } else {
        stillInvalid.push({
          row: employeeData as CSVEmployeeData,
          errors: validation.errors,
          rowData: editedRow
        });
      }
    });
    
    return { correctedEmployees, stillInvalid };
  };

  const handleUploadEditedRows = () => {
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
      
      // Prepare data for database - include User ID, let UUID be auto-generated
      const employeesData = employees.map(emp => {
        return {
          user_id: emp.userId, // Map userId to user_id for database
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
        };
      });
      
      console.log("Attempting to insert employees with User IDs:", employeesData);
      
      // Use the insert method - UUID will be auto-generated
      const { error } = await supabase
        .from('employees')
        .insert(employeesData);

      if (error) {
        console.error('Upload to database error:', error);
        throw error;
      }

      toast({
        title: "Upload Successful",
        description: `Successfully added ${employees.length} employees.`,
      });
      
      setShowValidationDialog(false);
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
