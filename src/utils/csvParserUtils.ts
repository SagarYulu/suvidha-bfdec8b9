
import Papa from 'papaparse';
import { CSVEmployeeData, RowData, ValidationError, ValidationResult } from '@/types';

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

const validateEmployeeData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.emp_id || data.emp_id.trim() === '') {
    errors.push('Employee ID is required');
  }

  if (!data.name || data.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!data.email || data.email.trim() === '') {
    errors.push('Email is required');
  } else if (!validateEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (data.phone && !validatePhoneNumber(data.phone)) {
    errors.push('Phone number must be 10 digits starting with 6-9');
  }

  if (!data.password || data.password.trim() === '') {
    errors.push('Password is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const parseCSVEmployees = (csvText: string): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validEmployees: CSVEmployeeData[] = [];
        const invalidRows: ValidationError[] = [];
        const allErrors: string[] = [];

        results.data.forEach((row: any, index: number) => {
          const validation = validateEmployeeData(row);
          
          const employeeData: CSVEmployeeData = {
            id: `temp-${index}`, // Ensure id is always present and required
            userId: row.userId || row['User ID'] || row.user_id || '',
            emp_id: row.emp_id || row['Employee ID'] || row['Emp ID'] || '',
            name: row.name || row.Name || '',
            email: row.email || row.Email || '',
            phone: row.phone || row.Phone || null,
            city: row.city || row.City || null,
            cluster: row.cluster || row.Cluster || null,
            role: row.role || row.Role || '',
            manager: row.manager || row.Manager || null,
            date_of_joining: row.date_of_joining || row['Date of Joining'] || null,
            date_of_birth: row.date_of_birth || row['Date of Birth'] || null,
            blood_group: row.blood_group || row['Blood Group'] || null,
            account_number: row.account_number || row['Account Number'] || null,
            ifsc_code: row.ifsc_code || row['IFSC Code'] || null,
            password: row.password || row.Password || 'changeme123',
            employeeId: row.emp_id || row['Employee ID'] || row['Emp ID'] || ''
          };

          const rowData: RowData = {
            id: employeeData.id,
            userId: employeeData.userId || '',
            emp_id: employeeData.emp_id,
            name: employeeData.name,
            email: employeeData.email,
            phone: employeeData.phone || '',
            city: employeeData.city || '',
            cluster: employeeData.cluster || '',
            role: employeeData.role,
            manager: employeeData.manager || '',
            date_of_joining: employeeData.date_of_joining || '',
            date_of_birth: employeeData.date_of_birth || '',
            blood_group: employeeData.blood_group || '',
            account_number: employeeData.account_number || '',
            ifsc_code: employeeData.ifsc_code || '',
            password: employeeData.password || 'changeme123',
            employeeId: employeeData.employeeId
          };

          if (validation.isValid) {
            validEmployees.push(employeeData);
          } else {
            const validationError: ValidationError = {
              row: employeeData,
              errors: validation.errors,
              rowData: rowData
            };
            invalidRows.push(validationError);
            allErrors.push(...validation.errors.map(error => `Row ${index + 1}: ${error}`));
          }
        });

        const result: ValidationResult = {
          isValid: invalidRows.length === 0,
          validRows: validEmployees,
          validEmployees: validEmployees,
          invalidRows,
          errors: allErrors,
          summary: {
            total: results.data.length,
            valid: validEmployees.length,
            invalid: invalidRows.length
          }
        };

        resolve(result);
      },
      error: (error) => {
        resolve({
          isValid: false,
          validRows: [],
          validEmployees: [],
          invalidRows: [],
          errors: [`CSV parsing error: ${error.message}`],
          summary: {
            total: 0,
            valid: 0,
            invalid: 0
          }
        });
      }
    });
  });
};

export const generateEmployeeCSVTemplate = (): string => {
  const headers = [
    'userId',
    'emp_id',
    'name', 
    'email',
    'phone',
    'city',
    'cluster',
    'role',
    'manager',
    'date_of_joining',
    'date_of_birth',
    'blood_group',
    'account_number',
    'ifsc_code',
    'password'
  ];

  const sampleData = [
    'john.doe',
    'EMP001',
    'John Doe',
    'john.doe@company.com',
    '9876543210',
    'Mumbai',
    'North Cluster',
    'Software Engineer',
    'Jane Smith',
    '15-01-2024',
    '15-05-1990',
    'O+',
    '12345678901234',
    'HDFC0001234',
    'password123'
  ];

  return Papa.unparse([headers, sampleData]);
};
