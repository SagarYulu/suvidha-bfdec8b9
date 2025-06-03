
import Papa from 'papaparse';
import { CSVDashboardUserData, DashboardUserRowData, DashboardUserValidationResult } from '@/types/dashboardUsers';

export const parseDashboardUsersCSV = (file: File): Promise<DashboardUserValidationResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVDashboardUserData>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Normalize header names
        const normalized = header.toLowerCase().trim();
        const headerMap: { [key: string]: string } = {
          'name': 'name',
          'email': 'email',
          'role': 'role',
          'phone': 'phone',
          'employee_id': 'employee_id',
          'employeeid': 'employee_id',
          'emp_id': 'employee_id',
          'city': 'city',
          'cluster': 'cluster',
          'manager': 'manager',
          'password': 'password',
          'user_id': 'user_id',
          'userid': 'user_id'
        };
        return headerMap[normalized] || header;
      },
      complete: (results) => {
        try {
          const valid: DashboardUserRowData[] = [];
          const invalid: Array<{ row: DashboardUserRowData; errors: string[] }> = [];

          results.data.forEach((row: CSVDashboardUserData) => {
            const errors: string[] = [];
            
            // Validate required fields
            if (!row.name || row.name.trim() === '') {
              errors.push('Name is required');
            }
            
            if (!row.email || row.email.trim() === '') {
              errors.push('Email is required');
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
              errors.push('Invalid email format');
            }
            
            if (!row.role || row.role.trim() === '') {
              errors.push('Role is required');
            }

            // Convert to DashboardUserRowData format
            const userRow: DashboardUserRowData = {
              userId: row.userId || row.user_id,
              name: row.name || '',
              email: row.email || '',
              role: row.role || '',
              phone: row.phone,
              employeeId: row.employeeId || row.employee_id,
              city: row.city,
              cluster: row.cluster,
              manager: row.manager,
              password: row.password
            };

            if (errors.length === 0) {
              valid.push(userRow);
            } else {
              invalid.push({ row: userRow, errors });
            }
          });

          resolve({ valid, invalid });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const downloadCSVTemplate = () => {
  const headers = [
    'name',
    'email', 
    'role',
    'phone',
    'employee_id',
    'city',
    'cluster',
    'manager',
    'password'
  ];

  const csvContent = headers.join(',') + '\n';
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'dashboard_users_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
