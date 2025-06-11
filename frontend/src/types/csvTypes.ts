
export interface CSVEmployeeData {
  name: string;
  email: string;
  employeeId: string;
  phone: string;
  city: string;
  cluster: string;
  manager: string;
  role: string;
  password: string;
}

export interface RowData {
  name: string;
  email: string;
  employeeId: string;
  phone: string;
  city: string;
  cluster: string;
  manager: string;
  role: string;
  password: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  validRows: RowData[];
  validEmployees: CSVEmployeeData[];
  invalidRows: ValidationError[];
  errors: ValidationError[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}
