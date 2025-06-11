
export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  city: string;
  cluster: string;
  role: string;
  manager?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface DashboardUserFilters {
  search?: string;
  city?: string;
  cluster?: string;
  role?: string;
  isActive?: boolean;
}

export interface DashboardUserBulkUpload {
  file: File;
  validateOnly?: boolean;
}

export interface DashboardUserValidationResult {
  isValid: boolean;
  errors: string[];
  validRows: DashboardUser[];
  invalidRows: Array<{
    rowNumber: number;
    data: Record<string, string>;
    errors: string[];
  }>;
}
