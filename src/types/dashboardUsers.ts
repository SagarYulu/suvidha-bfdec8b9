
export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  employeeId?: string;
  userId?: string;
  city?: string;
  cluster?: string;
  manager?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardUserRowData {
  userId?: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  employeeId?: string;
  employee_id?: string;
  city?: string;
  cluster?: string;
  manager?: string;
  password?: string;
}

export interface CSVDashboardUserData {
  userId?: string;
  user_id?: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  employeeId?: string;
  employee_id?: string;
  city?: string;
  cluster?: string;
  manager?: string;
  password?: string;
}

export interface DashboardUserValidationResult {
  valid: DashboardUserRowData[];
  invalid: Array<{
    row: DashboardUserRowData;
    errors: string[];
  }>;
}
