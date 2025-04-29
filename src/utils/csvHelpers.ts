
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
    
    // Support both YYYY-MM-DD and DD-MM-YYYY formats when validating
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}-\d{2}-\d{4}$/  // DD-MM-YYYY
    ];
    
    if (!datePatterns.some(pattern => pattern.test(dateStr))) {
      return false;
    }
    
    let date;
    if (dateStr.includes('-')) {
      if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
        // Parse DD-MM-YYYY format
        const [day, month, year] = dateStr.split('-').map(Number);
        date = new Date(year, month - 1, day);
        return date instanceof Date && !isNaN(date.getTime()) && 
               date.getDate() === day && 
               date.getMonth() === month - 1 && 
               date.getFullYear() === year;
      } else {
        // Parse YYYY-MM-DD format
        date = new Date(dateStr);
      }
    } else {
      date = new Date(dateStr);
    }
    
    return date instanceof Date && !isNaN(date.getTime());
  };

  if (data.date_of_joining && !isValidDate(data.date_of_joining)) {
    errors.push(`Invalid date of joining: ${data.date_of_joining}. Use format DD-MM-YYYY.`);
  }

  if (data.date_of_birth && !isValidDate(data.date_of_birth)) {
    errors.push(`Invalid date of birth: ${data.date_of_birth}. Use format DD-MM-YYYY.`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Convert date from any supported format to DD-MM-YYYY
export const formatDateToDDMMYYYY = (dateStr: string | null): string | null => {
  if (!dateStr) return null;
  
  let date;
  if (dateStr.includes('-')) {
    if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
      // Already in DD-MM-YYYY format
      return dateStr;
    } else {
      // Assume YYYY-MM-DD format
      const [year, month, day] = dateStr.split('-');
      return `${day}-${month}-${year}`;
    }
  }
  
  // Try to parse using Date constructor
  date = new Date(dateStr);
  if (date instanceof Date && !isNaN(date.getTime())) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
  
  return dateStr; // Return original if can't parse
};

// Convert date from DD-MM-YYYY to YYYY-MM-DD for database storage
export const formatDateToYYYYMMDD = (dateStr: string | null): string | null => {
  if (!dateStr) return null;
  
  // If already in YYYY-MM-DD format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }
  
  // Convert from DD-MM-YYYY to YYYY-MM-DD
  if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  }
  
  return dateStr; // Return original if can't parse
};

export const parseEmployeeCSV = (file: File): Promise<{
  validEmployees: EmployeeData[],
  invalidRows: {row: CSVEmployeeData, errors: string[], rowData: Record<string, string | null>}[]
}> => {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVEmployeeData>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validEmployees: EmployeeData[] = [];
        const invalidRows: {row: CSVEmployeeData, errors: string[], rowData: Record<string, string | null>}[] = [];

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

          // Generate a structured data object for display
          const rowData = {
            emp_id: row.emp_id || '',
            name: row.name || '',
            email: row.email || '',
            phone: row.phone || '',
            city: row.city || '',
            cluster: row.cluster || '',
            role: row.role || '',
            manager: row.manager || '',
            date_of_joining: formatDateToDDMMYYYY(row.date_of_joining) || '',
            date_of_birth: formatDateToDDMMYYYY(row.date_of_birth) || '',
            blood_group: row.blood_group || '',
            account_number: row.account_number || '',
            ifsc_code: row.ifsc_code || '',
          };

          // Validate the data using the common validation function
          const validation = validateEmployeeData(employeeData);
          
          if (validation.isValid) {
            validEmployees.push({
              ...employeeData as EmployeeData,
              // Convert dates to YYYY-MM-DD format for database
              date_of_joining: formatDateToYYYYMMDD(employeeData.date_of_joining),
              date_of_birth: formatDateToYYYYMMDD(employeeData.date_of_birth),
              password: 'changeme123' // Default password
            });
          } else {
            invalidRows.push({ row, errors: validation.errors, rowData });
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
    'YL001,John Doe,john@yulu.com,9876543210,Bangalore,Koramangala,Mechanic,Jane Smith,01-01-2024,01-01-1990,O+,1234567890,HDFC0001234',
    'YL002,Jane Smith,jane@yulu.com,9876543211,Delhi,GURGAON,Zone Screener,Mark Johnson,15-02-2024,20-05-1992,A-,9876543210,ICIC0001234'
  ].join('\n');

  return csvContent;
};
