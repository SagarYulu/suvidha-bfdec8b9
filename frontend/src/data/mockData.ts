
import { Issue, User } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@yulu.bike',
    phone: '+91-9876543210',
    employeeId: 'YUL001',
    city: 'Mumbai',
    cluster: 'West',
    role: 'user',
    manager: 'Jane Smith',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@yulu.bike',
    phone: '+91-9876543211',
    employeeId: 'YUL002',
    city: 'Mumbai',
    cluster: 'West',
    role: 'agent',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z'
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@yulu.bike',
    phone: '+91-9876543212',
    employeeId: 'YUL000',
    city: 'Bangalore',
    cluster: 'South',
    role: 'admin',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z'
  }
];

export const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Login Issue',
    description: 'Unable to login to the mobile app',
    status: 'open',
    priority: 'high',
    typeId: 'technical',
    subTypeId: 'login_issue',
    employeeUuid: '1',
    assignedTo: '2',
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    title: 'Salary Query',
    description: 'Question about salary calculation for this month',
    status: 'in_progress',
    priority: 'medium',
    typeId: 'financial',
    subTypeId: 'salary_query',
    employeeUuid: '1',
    assignedTo: '2',
    createdAt: '2024-01-19T14:15:00Z',
    updatedAt: '2024-01-20T09:20:00Z'
  }
];

export const mockFeedbackData = {
  sentimentDistribution: [
    { name: 'Happy', value: 65 },
    { name: 'Neutral', value: 25 },
    { name: 'Sad', value: 10 }
  ],
  topicDistribution: [
    { name: 'Service Quality', count: 45, previousCount: 40 },
    { name: 'Response Time', count: 32, previousCount: 35 },
    { name: 'Resolution Speed', count: 28, previousCount: 30 },
    { name: 'Communication', count: 23, previousCount: 20 }
  ],
  moodTrend: [
    { date: '2024-01-15', rating: 4.2, previousRating: 4.0 },
    { date: '2024-01-16', rating: 4.3, previousRating: 4.1 },
    { date: '2024-01-17', rating: 4.1, previousRating: 4.2 },
    { date: '2024-01-18', rating: 4.4, previousRating: 4.0 },
    { date: '2024-01-19', rating: 4.5, previousRating: 4.3 },
    { date: '2024-01-20', rating: 4.2, previousRating: 4.4 }
  ]
};
