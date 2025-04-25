
import Papa from 'papaparse';

export interface EmployeeUploadData {
  emp_id: string;
  name: string;
  phone: string;
  city: string;
  cluster: string;
  role: 'admin' | 'employee';
  manager: string;
  date_of_joining: string;
  date_of_birth: string;
  blood_group: string;
  email: string;
  account_number: string;
  ifsc_code: string;
}

export const validateEmployeeData = (data: any): data is EmployeeUploadData => {
  return (
    data.emp_id &&
    data.name &&
    data.email &&
    data.role &&
    ['admin', 'employee'].includes(data.role)
  );
};

export const parseEmployeeCSV = (file: File): Promise<EmployeeUploadData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validEmployees = results.data.filter(validateEmployeeData);
        resolve(validEmployees as EmployeeUploadData[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
