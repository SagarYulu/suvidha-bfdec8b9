
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  city: string;
  cluster: string;
  manager?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  employeeUuid: string;
  typeId: string;
  subTypeId: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  assignedTo?: string;
  attachmentUrl?: string;
  attachments?: any;
  comments: IssueComment[];
  lastStatusChangeAt?: string;
  reopenableUntil?: string;
  previouslyClosedAt?: string;
  mappedTypeId?: string;
  mappedSubTypeId?: string;
  mappedAt?: string;
  mappedBy?: string;
  typeLabel?: string;
  subTypeLabel?: string;
}

export interface IssueComment {
  id: string;
  employeeUuid: string;
  content: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  issueId: string;
  employeeUuid: string;
  sentiment: 'happy' | 'neutral' | 'sad';
  feedbackOption: string;
  createdAt: string;
  cluster?: string;
  city?: string;
  agentId?: string;
  agentName?: string;
}

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}
