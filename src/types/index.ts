
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  city: string;
  cluster: string;
  manager: string;
  role: string; // Changed from "employee" | "admin" to string to accommodate more roles
  password: string;
  dateOfJoining?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  accountNumber?: string;
  ifscCode?: string;
}

export interface Issue {
  id: string;
  userId: string;
  typeId: string;
  subTypeId: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  assignedTo?: string;
  comments: IssueComment[];
}

export interface IssueComment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: string | null; // Changed from specific type to string
}

// Add a new interface for CSV employee data
export interface CSVEmployeeData {
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
  password?: string;
}

// Row data interface - explicitly defined with all fields as strings
export interface RowData {
  emp_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  cluster: string;
  role: string;
  manager: string;
  date_of_joining: string;
  date_of_birth: string;
  blood_group: string;
  account_number: string;
  ifsc_code: string;
}

// Define a string-indexed interface for edited rows
export interface EditedRowsRecord {
  [key: string]: RowData;
}

export interface ValidationError {
  row: CSVEmployeeData;
  errors: string[];
  rowData: RowData;
}

export interface ValidationResult {
  validEmployees: CSVEmployeeData[];
  invalidRows: ValidationError[];
}
