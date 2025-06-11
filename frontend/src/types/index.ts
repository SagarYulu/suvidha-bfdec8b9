
// Core types for the application
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  employeeId?: string;
  city?: string;
  cluster?: string;
  manager?: string;
  role?: string;
  password?: string;
  dateOfJoining?: string;
  bloodGroup?: string;
  dateOfBirth?: string;
  accountNumber?: string;
  ifscCode?: string;
  userId?: string;
}

export interface Issue {
  id: string;
  employeeUuid: string;
  typeId: string;
  subTypeId: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  comments: Comment[];
  assignedTo?: string;
  resolutionNotes?: string;
}

export interface Comment {
  id: string;
  employeeUuid: string;
  content: string;
  createdAt: string;
}

export interface DashboardUser {
  id: string;
  email: string;
  name: string;
  role: string;
  cluster?: string;
  city?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Analytics {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  avgResolutionTime: number;
  issuesByType: { [key: string]: number };
  issuesByCity: { [key: string]: number };
  issuesByPriority: { [key: string]: number };
  issuesByStatus: { [key: string]: number };
  trends: {
    daily: Array<{ date: string; count: number }>;
    weekly: Array<{ week: string; count: number }>;
    monthly: Array<{ month: string; count: number }>;
  };
}

export interface Feedback {
  id: string;
  issueId: string;
  employeeUuid: string;
  rating: number;
  comments?: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: string | null;
}
