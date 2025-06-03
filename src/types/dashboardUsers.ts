
export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  employeeId?: string;
  city?: string;
  cluster?: string;
  manager?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardUserRowData {
  name: string;
  email: string;
  role: string;
  phone?: string;
  employeeId?: string;
  city?: string;
  cluster?: string;
  manager?: string;
}
