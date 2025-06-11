
import Papa from 'papaparse';

export interface CSVEmployeeData {
  id?: string;
  userId: string;
  emp_id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  cluster?: string | null;
  role: string;
  manager?: string | null;
  date_of_joining?: string | null;
  date_of_birth?: string | null;
  blood_group?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  password: string;
  employeeId?: string;
}

export interface RowData {
  id?: string;
  userId: string;
  emp_id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  cluster?: string | null;
  role: string;
  manager?: string | null;
  date_of_joining?: string | null;
  date_of_birth?: string | null;
  blood_group?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  password: string;
  employeeId?: string;
  [key: string]: any;
}

export interface ValidationError {
  row: CSVEmployeeData;
  errors: string[];
  rowData: RowData;
}

export interface ValidationResult {
  isValid: boolean;
  validRows: CSVEmployeeData[];
  validEmployees: CSVEmployeeData[];
  invalidRows: ValidationError[];
  errors: string[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

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
        const validRows: CSVEmployeeData[] = [];
        const invalidRows: ValidationError[] = [];
        const allErrors: string[] = [];

        results.data.forEach((row: any, index: number) => {
          const validation = validateEmployeeData(row);
          
          const employeeData: CSVEmployeeData = {
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
            ...employeeData,
            ...row
          };

          if (validation.isValid) {
            validRows.push(employeeData);
          } else {
            invalidRows.push({
              row: employeeData,
              errors: validation.errors,
              rowData: rowData
            });
            allErrors.push(...validation.errors.map(error => `Row ${index + 1}: ${error}`));
          }
        });

        const result: ValidationResult = {
          isValid: invalidRows.length === 0,
          validRows,
          validEmployees: validRows,
          invalidRows,
          errors: allErrors,
          summary: {
            total: results.data.length,
            valid: validRows.length,
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
