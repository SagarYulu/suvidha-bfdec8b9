
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  city: string;
  cluster: string;
  manager: string;
  role: "employee" | "admin";
  password: string;
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
  role: "employee" | "admin" | null;
}
