
import { useState } from 'react';
import { CSVEmployeeData, RowData, ValidationResult, ValidationError } from '@/types/csvTypes';
import { validateEmployeeData } from '@/utils/csvHelpers';

export const useBulkUpload = () => {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: false,
    validRows: [],
    validEmployees: [],
    invalidRows: [],
    errors: [],
    summary: {
      total: 0,
      valid: 0,
      invalid: 0
    }
  });

  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const validateData = async (data: RowData[]) => {
    setIsValidating(true);
    
    try {
      const validRows: RowData[] = [];
      const errors: ValidationError[] = [];
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowErrors = validateEmployeeData(row);
        
        if (rowErrors.length === 0) {
          validRows.push(row);
        } else {
          errors.push(...rowErrors.map(error => ({
            field: error.field || 'unknown',
            message: error.message || 'Validation error',
            value: error.value
          })));
        }
      }
      
      const validEmployees: CSVEmployeeData[] = validRows.map(row => ({
        name: row.name,
        email: row.email,
        employeeId: row.employeeId,
        phone: row.phone,
        city: row.city,
        cluster: row.cluster,
        manager: row.manager,
        role: row.role,
        password: row.password
      }));
      
      setValidationResult({
        isValid: errors.length === 0,
        validRows,
        validEmployees,
        invalidRows: errors,
        errors,
        summary: {
          total: data.length,
          valid: validRows.length,
          invalid: errors.length
        }
      });
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        isValid: false,
        validRows: [],
        validEmployees: [],
        invalidRows: [],
        errors: [{ field: 'general', message: 'Validation failed' }],
        summary: {
          total: data.length,
          valid: 0,
          invalid: data.length
        }
      });
    } finally {
      setIsValidating(false);
    }
  };

  const uploadData = async (validEmployees: CSVEmployeeData[]) => {
    setIsUploading(true);
    try {
      // TODO: Implement API call to backend
      console.log('Uploading employees:', validEmployees);
      // Implementation needed
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    validationResult,
    isValidating,
    isUploading,
    validateData,
    uploadData
  };
};
