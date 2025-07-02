export interface User {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  employeeId?: string;
  city?: string;
  cluster?: string;
  manager?: string;
  role: string;
  password?: string;
  dateOfJoining?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  accountNumber?: string;
  ifscCode?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  permissions?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  isAdminLogin?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: string;
  employeeId?: string;
  phone?: string;
  city?: string;
  cluster?: string;
  manager?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  role: string | null;
  permissions: string[];
  isLoading: boolean;
}