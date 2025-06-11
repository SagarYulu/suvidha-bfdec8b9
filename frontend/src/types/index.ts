
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  role: string;
  manager?: string;
  cluster: string;
  city: string;
  createdAt: string;
  updatedAt: string;
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
  updatedAt: string;
  closedAt?: string;
  assignedTo?: string;
  mappedTypeId?: string;
  mappedSubTypeId?: string;
  mappedAt?: string;
  mappedBy?: string;
  attachments?: string[];
  attachmentUrl?: string;
  comments: IssueComment[];
  employee?: User;
}

export interface IssueComment {
  id: string;
  issueId: string;
  employeeUuid: string;
  content: string;
  createdAt: string;
}

export interface IssueType {
  id: string;
  name: string;
  description?: string;
  subTypes: IssueSubType[];
}

export interface IssueSubType {
  id: string;
  typeId: string;
  name: string;
  description?: string;
}

export interface TicketFeedback {
  id: string;
  issueId: string;
  employeeUuid: string;
  sentiment: 'happy' | 'neutral' | 'sad';
  feedbackOption: string;
  agentId?: string;
  agentName?: string;
  cluster?: string;
  city?: string;
  createdAt: string;
}

export interface CreateIssueData {
  typeId: string;
  subTypeId: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachmentUrl?: string;
}

export interface UpdateIssueData {
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  mappedTypeId?: string;
  mappedSubTypeId?: string;
}
