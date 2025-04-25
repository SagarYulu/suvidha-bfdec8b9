
import Papa from 'papaparse';
import { type Tables } from '@/integrations/supabase/types';

type EmployeeData = Omit<Tables<'employees'>, 'id' | 'created_at' | 'updated_at'>;
type CSVEmployeeData = Record<keyof EmployeeData, string | null>;

export const validateEmployeeData = (data: Partial<EmployeeData>): boolean => {
  // Required fields
  const requiredFields = ['emp_id', 'name', 'email', 'role'];
  const hasRequiredFields = requiredFields.every(field => Boolean(data[field as keyof EmployeeData]));
  
  // Role validation
  const validRoles = ['admin', 'employee'];
  const hasValidRole = data.role ? validRoles.includes(data.role) : false;

  // Date format validation for optional date fields
  const isValidDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return true; // Optional field
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  };

  return hasRequiredFields && 
         hasValidRole && 
         isValidDate(data.date_of_joining) && 
         isValidDate(data.date_of_birth);
};

export const parseEmployeeCSV = (file: File): Promise<EmployeeData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVEmployeeData>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validEmployees = results.data
          .filter(validateEmployeeData)
          .map(employee => ({
            emp_id: employee.emp_id as string,
            name: employee.name as string,
            email: employee.email as string,
            phone: employee.phone,
            city: employee.city,
            cluster: employee.cluster,
            role: employee.role as string,
            manager: employee.manager,
            date_of_joining: employee.date_of_joining,
            date_of_birth: employee.date_of_birth,
            blood_group: employee.blood_group,
            account_number: employee.account_number,
            ifsc_code: employee.ifsc_code,
            password: 'changeme123' // Default password that should be changed on first login
          }));
        resolve(validEmployees);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const getCSVTemplate = () => {
  const headers = [
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
    'ifsc_code'
  ];

  const csvContent = [
    headers.join(','),
    'YL001,John Doe,john@yulu.com,9876543210,Bangalore,Central,employee,Jane Smith,2024-01-01,1990-01-01,O+,1234567890,HDFC0001234'
  ].join('\n');

  return csvContent;
};
