
import Papa from 'papaparse';

export interface CSVEmployeeData {
  empId: string;
  name: string;
  email: string;
  phone?: string;
  userId?: string;
  dateOfJoining?: string;
  ifscCode?: string;
  accountNumber?: string;
  bloodGroup?: string;
  password: string;
  manager?: string;
  role?: string;
  cluster?: string;
  city?: string;
  dateOfBirth?: string;
}

export interface RowData {
  [key: string]: any;
}

export interface ValidationResult {
  isValid: boolean;
  validRows: CSVEmployeeData[];
  invalidRows: {
    row: CSVEmployeeData;
    errors: string[];
    rowData: RowData;
  }[];
  errors: string[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
  validEmployees?: CSVEmployeeData[];
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

  if (!data.empId || data.empId.trim() === '') {
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
        const invalidRows: { row: CSVEmployeeData; errors: string[]; rowData: RowData }[] = [];
        const allErrors: string[] = [];

        results.data.forEach((row: any, index: number) => {
          const validation = validateEmployeeData(row);
          
          const employeeData: CSVEmployeeData = {
            empId: row.empId || row['Employee ID'] || row['Emp ID'] || '',
            name: row.name || row.Name || '',
            email: row.email || row.Email || '',
            phone: row.phone || row.Phone || '',
            userId: row.userId || row['User ID'] || '',
            dateOfJoining: row.dateOfJoining || row['Date of Joining'] || '',
            ifscCode: row.ifscCode || row['IFSC Code'] || '',
            accountNumber: row.accountNumber || row['Account Number'] || '',
            bloodGroup: row.bloodGroup || row['Blood Group'] || '',
            password: row.password || row.Password || '',
            manager: row.manager || row.Manager || '',
            role: row.role || row.Role || '',
            cluster: row.cluster || row.Cluster || '',
            city: row.city || row.City || '',
            dateOfBirth: row.dateOfBirth || row['Date of Birth'] || ''
          };

          if (validation.isValid) {
            validRows.push(employeeData);
          } else {
            invalidRows.push({
              row: employeeData,
              errors: validation.errors,
              rowData: row
            });
            allErrors.push(...validation.errors.map(error => `Row ${index + 1}: ${error}`));
          }
        });

        const result: ValidationResult = {
          isValid: invalidRows.length === 0,
          validRows,
          invalidRows,
          errors: allErrors,
          summary: {
            total: results.data.length,
            valid: validRows.length,
            invalid: invalidRows.length
          },
          validEmployees: validRows // Include this for backward compatibility
        };

        resolve(result);
      },
      error: (error) => {
        resolve({
          isValid: false,
          validRows: [],
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
    'empId',
    'name', 
    'email',
    'phone',
    'userId',
    'dateOfJoining',
    'ifscCode',
    'accountNumber',
    'bloodGroup',
    'password',
    'manager',
    'role',
    'cluster',
    'city',
    'dateOfBirth'
  ];

  const sampleData = [
    'EMP001',
    'John Doe',
    'john.doe@company.com',
    '9876543210',
    'john.doe',
    '2024-01-15',
    'HDFC0001234',
    '12345678901234',
    'O+',
    'password123',
    'Jane Smith',
    'Software Engineer',
    'North Cluster',
    'Mumbai',
    '1990-05-15'
  ];

  return Papa.unparse([headers, sampleData]);
};
