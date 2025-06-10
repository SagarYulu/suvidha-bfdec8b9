
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId?: string;
  phone?: string;
  city?: string;
  cluster?: string;
  manager?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Issue {
  id: string;
  employeeUuid: string;
  typeId: string;
  subTypeId: string;
  title?: string;
  description: string;
  category?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  attachmentUrl?: string;
  attachments?: string[];
  mappedTypeId?: string;
  mappedSubTypeId?: string;
  mappedBy?: string;
  mappedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
  internalComments?: InternalComment[];
}

export interface Comment {
  id: string;
  issueId: string;
  authorId?: string;
  employeeUuid?: string;
  content: string;
  createdAt: string;
}

export interface InternalComment {
  id: string;
  issueId: string;
  authorId?: string;
  employeeUuid: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  avgResolutionTime: string;
  resolvedToday: number;
}

export interface Feedback {
  id: string;
  issueId: string;
  employeeUuid: string;
  feedbackOption: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  rating?: number;
  feedbackText?: string;
  resolutionSatisfaction?: string;
  agentId?: string;
  agentName?: string;
  city?: string;
  cluster?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  issueId: string;
  userId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}
