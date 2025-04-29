
import Papa from 'papaparse';
import { type Tables } from '@/integrations/supabase/types';
import { ROLE_OPTIONS, CITY_OPTIONS, CLUSTER_OPTIONS } from '@/data/formOptions';

type EmployeeData = Omit<Tables<'employees'>, 'id' | 'created_at' | 'updated_at'>;
type CSVEmployeeData = Record<keyof EmployeeData, string | null>;

export const validateEmployeeData = (data: Partial<EmployeeData>): boolean => {
  // Required fields
  const requiredFields = ['emp_id', 'name', 'email', 'role'];
  const hasRequiredFields = requiredFields.every(field => Boolean(data[field as keyof EmployeeData]));
  
  // Role validation
  const hasValidRole = data.role ? ROLE_OPTIONS.map(r => r.toLowerCase()).includes(data.role.toLowerCase()) : false;

  // City validation (if provided)
  const hasValidCity = !data.city || 
    CITY_OPTIONS.map(c => c.toLowerCase()).includes(data.city.toLowerCase());

  // Cluster validation (if city and cluster are provided)
  const hasValidCluster = !data.cluster || !data.city || 
    (CLUSTER_OPTIONS[data.city] && 
      CLUSTER_OPTIONS[data.city].map(c => c.toLowerCase()).includes(data.cluster.toLowerCase()));

  // Email format validation
  const hasValidEmail = !data.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);

  // Date format validation for optional date fields
  const isValidDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return true; // Optional field
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime());
  };

  return hasRequiredFields && 
         hasValidRole && 
         hasValidCity &&
         hasValidCluster &&
         hasValidEmail &&
         isValidDate(data.date_of_joining) && 
         isValidDate(data.date_of_birth);
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
          const errors: string[] = [];
          
          // Check required fields
          const requiredFields = ['emp_id', 'name', 'email', 'role'];
          for (const field of requiredFields) {
            if (!row[field as keyof CSVEmployeeData]) {
              errors.push(`Missing required field: ${field}`);
            }
          }

          // Check role validation
          if (row.role && !ROLE_OPTIONS.map(r => r.toLowerCase()).includes(row.role.toLowerCase())) {
            errors.push(`Invalid role: ${row.role}. Valid options are: ${ROLE_OPTIONS.join(', ')}`);
          }

          // Check city validation
          if (row.city && !CITY_OPTIONS.map(c => c.toLowerCase()).includes(row.city.toLowerCase())) {
            errors.push(`Invalid city: ${row.city}. Valid options are: ${CITY_OPTIONS.join(', ')}`);
          }

          // Check cluster validation
          if (row.city && row.cluster) {
            const cityKey = CITY_OPTIONS.find(c => c.toLowerCase() === row.city?.toLowerCase());
            if (cityKey && CLUSTER_OPTIONS[cityKey]) {
              if (!CLUSTER_OPTIONS[cityKey].map(c => c.toLowerCase()).includes(row.cluster!.toLowerCase())) {
                errors.push(`Invalid cluster: ${row.cluster} for city: ${row.city}. Valid options are: ${CLUSTER_OPTIONS[cityKey].join(', ')}`);
              }
            }
          }

          // Check email format
          if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
            errors.push(`Invalid email format: ${row.email}`);
          }

          // Check date formats
          const isValidDate = (dateStr: string | null | undefined) => {
            if (!dateStr) return true;
            const date = new Date(dateStr);
            return date instanceof Date && !isNaN(date.getTime());
          };

          if (row.date_of_joining && !isValidDate(row.date_of_joining)) {
            errors.push(`Invalid date of joining: ${row.date_of_joining}. Use format YYYY-MM-DD.`);
          }

          if (row.date_of_birth && !isValidDate(row.date_of_birth)) {
            errors.push(`Invalid date of birth: ${row.date_of_birth}. Use format YYYY-MM-DD.`);
          }

          if (errors.length === 0) {
            validEmployees.push({
              emp_id: row.emp_id as string,
              name: row.name as string,
              email: row.email as string,
              phone: row.phone,
              city: row.city,
              cluster: row.cluster,
              role: row.role as string,
              manager: row.manager,
              date_of_joining: row.date_of_joining,
              date_of_birth: row.date_of_birth,
              blood_group: row.blood_group,
              account_number: row.account_number,
              ifsc_code: row.ifsc_code,
              password: 'changeme123' // Default password
            });
          } else {
            invalidRows.push({ row, errors });
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
