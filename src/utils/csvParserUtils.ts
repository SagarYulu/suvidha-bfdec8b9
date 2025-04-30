
import Papa from 'papaparse';
import { CSVEmployeeData, RowData, ValidationResult } from '@/types';
import { validateEmployeeData } from './validationUtils';
import { formatDateToYYYYMMDD } from './dateUtils';

/**
 * Parses and validates a CSV file containing employee data
 */
export const parseEmployeeCSV = (file: File): Promise<ValidationResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validEmployees: CSVEmployeeData[] = [];
        const invalidRows: {row: CSVEmployeeData, errors: string[], rowData: RowData}[] = [];
        
        // Process each row
        results.data.forEach((row) => {
          // Skip empty rows
          if (Object.values(row).every(val => val === null || val === '')) {
            return;
          }
          
          // Convert CSV data to employee format
          const employeeData: Partial<CSVEmployeeData> = {
            id: row.id || '',
            emp_id: row.emp_id || '',
            name: row.name || '',
            email: row.email || '',
            phone: row.phone || null,
            city: row.city || null,
            cluster: row.cluster || null,
            manager: row.manager || null,
            role: row.role || '',
            date_of_joining: row.date_of_joining || null,
            date_of_birth: row.date_of_birth || null,
            blood_group: row.blood_group || null,
            account_number: row.account_number || null,
            ifsc_code: row.ifsc_code || null,
            password: row.password || 'changeme123', // Use provided password or default
          };

          // Generate a structured data object for display
          const rowData: RowData = {
            id: row.id || '',
            emp_id: row.emp_id || '',
            name: row.name || '',
            email: row.email || '',
            phone: row.phone || '',
            city: row.city || '',
            cluster: row.cluster || '',
            manager: row.manager || '',
            role: row.role || '',
            date_of_joining: row.date_of_joining || '',
            date_of_birth: row.date_of_birth || '',
            blood_group: row.blood_group || '',
            account_number: row.account_number || '',
            ifsc_code: row.ifsc_code || '',
            password: row.password || 'changeme123' // Use provided password or default
          };

          // Validate the data using the common validation function
          const validation = validateEmployeeData(employeeData);
          
          if (validation.isValid) {
            validEmployees.push({
              ...employeeData as CSVEmployeeData,
              // Convert dates to YYYY-MM-DD format for database
              date_of_joining: formatDateToYYYYMMDD(employeeData.date_of_joining),
              date_of_birth: formatDateToYYYYMMDD(employeeData.date_of_birth),
              password: employeeData.password || 'changeme123' // Ensure password is set
            });
          } else {
            invalidRows.push({ 
              row: employeeData as CSVEmployeeData, 
              errors: validation.errors,
              rowData
            });
          }
        });

        resolve({ validEmployees, invalidRows });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
