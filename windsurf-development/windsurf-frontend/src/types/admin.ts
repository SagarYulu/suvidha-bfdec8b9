
export interface Role {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cluster {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: any;
  createdBy: string;
  userName?: string;
  createdAt: string;
}

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  employeeId?: string;
  role: string;
  phone?: string;
  city?: string;
  cluster?: string;
  manager?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  employeeId: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}
