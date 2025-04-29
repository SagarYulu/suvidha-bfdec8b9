
import Papa from 'papaparse';
import { type Tables } from '@/integrations/supabase/types';
import { ROLE_OPTIONS, CITY_OPTIONS, CLUSTER_OPTIONS } from '@/data/formOptions';

type EmployeeData = Omit<Tables<'employees'>, 'id' | 'created_at' | 'updated_at'>;
type CSVEmployeeData = Record<keyof EmployeeData, string | null>;

export const validateEmployeeData = (data: Partial<EmployeeData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required fields
  const requiredFields = ['emp_id', 'name', 'email', 'role'];
  const missingFields = requiredFields.filter(field => !data[field as keyof EmployeeData]);
  
  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // Role validation
  if (data.role) {
    const validRoles = ROLE_OPTIONS.map(r => r.toLowerCase());
    if (!validRoles.includes(data.role.toLowerCase())) {
      errors.push(`Invalid role: ${data.role}. Valid options are: ${ROLE_OPTIONS.join(', ')}`);
    }
  }

  // City validation (if provided)
  if (data.city) {
    const validCities = CITY_OPTIONS.map(c => c.toLowerCase());
    if (!validCities.includes(data.city.toLowerCase())) {
      errors.push(`Invalid city: ${data.city}. Valid options are: ${CITY_OPTIONS.join(', ')}`);
    }
  }

  // Cluster validation (if city and cluster are provided)
  if (data.city && data.cluster) {
    const cityKey = CITY_OPTIONS.find(c => c.toLowerCase() === data.city?.toLowerCase());
    if (cityKey && CLUSTER_OPTIONS[cityKey]) {
      const validClusters = CLUSTER_OPTIONS[cityKey].map(c => c.toLowerCase());
      if (!validClusters.includes(data.cluster.toLowerCase())) {
        errors.push(`Invalid cluster: ${data.cluster} for city: ${data.city}. Valid options are: ${CLUSTER_OPTIONS[cityKey].join(', ')}`);
      }
    }
  }

  // Email format validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push(`Invalid email format: ${data.email}`);
  }

  // Date format validation for optional date fields
  const isValidDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return true; // Optional field
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  };

  if (data.date_of_joining && !isValidDate(data.date_of_joining)) {
    errors.push(`Invalid date of joining: ${data.date_of_joining}. Use format YYYY-MM-DD.`);
  }

  if (data.date_of_birth && !isValidDate(data.date_of_birth)) {
    errors.push(`Invalid date of birth: ${data.date_of_birth}. Use format YYYY-MM-DD.`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const parseEmployeeCSV = (file: File): Promise<{
  validEmployees: EmployeeData[],
  invalidRows: {row: CSVEmployeeData, errors: string[]}[]
}> => {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVEmployeeData>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validEmployees: EmployeeData[] = [];
        const invalidRows: {row: CSVEmployeeData, errors: string[]}[] = [];

        results.data.forEach(row => {
          // Skip empty rows
          if (Object.values(row).every(val => val === null || val === '')) {
            return;
          }
          
          // Convert CSV data to employee format
          const employeeData: Partial<EmployeeData> = {
            emp_id: row.emp_id || '',
            name: row.name || '',
            email: row.email || '',
            phone: row.phone || null,
            city: row.city || null,
            cluster: row.cluster || null,
            role: row.role || '',
            manager: row.manager || null,
            date_of_joining: row.date_of_joining || null,
            date_of_birth: row.date_of_birth || null,
            blood_group: row.blood_group || null,
            account_number: row.account_number || null,
            ifsc_code: row.ifsc_code || null,
          };

          // Validate the data using the common validation function
          const validation = validateEmployeeData(employeeData);
          
          if (validation.isValid) {
            validEmployees.push({
              ...employeeData as EmployeeData,
              password: 'changeme123' // Default password
            });
          } else {
            invalidRows.push({ row, errors: validation.errors });
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
    'YL001,John Doe,john@yulu.com,9876543210,Bangalore,Koramangala,Mechanic,Jane Smith,2024-01-01,1990-01-01,O+,1234567890,HDFC0001234',
    'YL002,Jane Smith,jane@yulu.com,9876543211,Delhi,GURGAON,Zone Screener,Mark Johnson,2024-02-15,1992-05-20,A-,9876543210,ICIC0001234'
  ].join('\n');

  return csvContent;
};
