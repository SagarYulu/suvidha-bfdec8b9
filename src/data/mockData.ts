
import { User, Issue, IssueComment } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Jane Manager',
    email: 'manager@example.com',
    role: 'manager',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Bob Agent',
    email: 'agent@example.com',
    role: 'agent',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Login Issue',
    description: 'Cannot access the system',
    issueType: 'technical',
    priority: 'high',
    status: 'open',
    employeeId: 'emp1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    comments: [
      {
        id: '1',
        employeeUuid: 'emp1',
        content: 'Initial report',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ]
  },
  {
    id: '2',
    title: 'Salary Query',
    description: 'Question about salary calculation',
    issueType: 'hr',
    priority: 'medium',
    status: 'resolved',
    employeeId: 'emp2',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T15:00:00Z',
    resolvedAt: '2024-01-14T15:00:00Z',
    comments: [
      {
        id: '2',
        employeeUuid: 'emp2',
        content: 'Need clarification on salary components',
        createdAt: '2024-01-14T09:00:00Z',
        updatedAt: '2024-01-14T09:00:00Z'
      },
      {
        id: '3',
        employeeUuid: 'admin1',
        content: 'Salary breakdown has been sent to your email',
        createdAt: '2024-01-14T15:00:00Z',
        updatedAt: '2024-01-14T15:00:00Z'
      }
    ]
  }
];
