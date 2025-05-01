
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { parseCSVDashboardUsers } from '@/utils/csvDashboardUsersParser';
import { CSVDashboardUserData, DashboardUserRowData } from '@/types/dashboardUsers';

type ValidationResults = {
  validUsers: CSVDashboardUserData[];
  invalidRows: {
    row: CSVDashboardUserData;
    errors: string[];
    rowData: DashboardUserRowData;
  }[];
};

const useDashboardUserBulkUpload = (onUploadSuccess?: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResults>({
    validUsers: [],
    invalidRows: []
  });
  const [editedRows, setEditedRows] = useState<Record<string, DashboardUserRowData>>({});

  const handleFileUpload = async (file: File) => {
    try {
      const results = await parseCSVDashboardUsers(file);
      setValidationResults(results);

      // Initialize editedRows with the current invalid rows
      const initialEditedRows: Record<string, DashboardUserRowData> = {};
      results.invalidRows.forEach((row, index) => {
        initialEditedRows[index.toString()] = row.rowData;
      });
      setEditedRows(initialEditedRows);

      setShowValidationDialog(true);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast({
        title: "Error",
        description: "Failed to parse CSV file. Please check the file format.",
        variant: "destructive"
      });
    }
  };

  const handleFieldEdit = (rowIndex: string, field: keyof DashboardUserRowData, value: string) => {
    setEditedRows(prev => ({
      ...prev,
      [rowIndex]: {
        ...prev[rowIndex],
        [field]: value
      }
    }));
  };

  const handleUploadEditedRows = async () => {
    if (validationResults.validUsers.length === 0 && Object.keys(editedRows).length === 0) {
      toast({
        title: "Warning",
        description: "No valid user data to upload.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // First, insert valid users from CSV
      if (validationResults.validUsers.length > 0) {
        const { error: validUsersError } = await supabase
          .from('dashboard_users')
          .insert(validationResults.validUsers.map(user => ({
            name: user.name,
            email: user.email,
            employee_id: user.employee_id,
            user_id: user.userId || user.user_id,
            phone: user.phone,
            city: user.city,
            cluster: user.cluster,
            manager: user.manager,
            role: user.role,
            password: user.password
          })));

        if (validUsersError) {
          throw new Error(`Error uploading valid users: ${validUsersError.message}`);
        }
      }

      // Then, insert edited rows that were previously invalid
      const editedRowsArray = Object.values(editedRows);
      if (editedRowsArray.length > 0) {
        const { error: editedRowsError } = await supabase
          .from('dashboard_users')
          .insert(editedRowsArray.map(row => ({
            name: row.name,
            email: row.email,
            employee_id: row.employee_id,
            user_id: row.userId,
            phone: row.phone,
            city: row.city,
            cluster: row.cluster,
            manager: row.manager,
            role: row.role,
            password: row.password
          })));

        if (editedRowsError) {
          throw new Error(`Error uploading edited rows: ${editedRowsError.message}`);
        }
      }

      // Success
      toast({
        title: "Success",
        description: `Successfully uploaded ${validationResults.validUsers.length + editedRowsArray.length} dashboard users.`
      });
      
      setShowValidationDialog(false);
      setValidationResults({ validUsers: [], invalidRows: [] });
      setEditedRows({});
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Error uploading dashboard users:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProceedAnyway = async () => {
    // Only proceed with valid users, ignore invalid ones
    if (validationResults.validUsers.length === 0) {
      toast({
        title: "Warning",
        description: "No valid user data to upload.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const { error } = await supabase
        .from('dashboard_users')
        .insert(validationResults.validUsers.map(user => ({
          name: user.name,
          email: user.email,
          employee_id: user.employee_id,
          user_id: user.userId || user.user_id,
          phone: user.phone,
          city: user.city,
          cluster: user.cluster,
          manager: user.manager,
          role: user.role,
          password: user.password
        })));

      if (error) {
        throw new Error(`Error uploading dashboard users: ${error.message}`);
      }

      toast({
        title: "Success",
        description: `Successfully uploaded ${validationResults.validUsers.length} dashboard users. ${validationResults.invalidRows.length} invalid entries were skipped.`
      });
      
      setShowValidationDialog(false);
      setValidationResults({ validUsers: [], invalidRows: [] });
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Error uploading dashboard users:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
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

export default useDashboardUserBulkUpload;
