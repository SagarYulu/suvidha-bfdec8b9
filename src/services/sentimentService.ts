
import { SentimentAlert } from '@/types';

export interface SentimentFilters {
  startDate?: string;
  endDate?: string;
  city?: string;
  cluster?: string;
  role?: string;
}

export interface SentimentEntry {
  id: string;
  rating: number;
  feedback_text?: string;
  tags?: string[];
  createdAt: string;
  employee_uuid: string;
  // Add additional properties that components expect
  sentiment_label?: string;
  sentiment_score?: number;
  city?: string;
  cluster?: string;
  role?: string;
  employee_name?: string;
  created_at?: string; // Alternative property name
  feedback?: string; // Alternative property name
}

// Mock data
const mockSentimentData: SentimentEntry[] = [
  {
    id: '1',
    rating: 4,
    feedback_text: 'Great work environment',
    tags: ['work-environment'],
    createdAt: '2024-01-15T10:00:00Z',
    employee_uuid: 'emp1',
    sentiment_label: 'positive',
    sentiment_score: 0.8,
    city: 'Mumbai',
    cluster: 'West',
    role: 'agent',
    employee_name: 'John Doe'
  },
  {
    id: '2',
    rating: 3,
    feedback_text: 'Could be better',
    tags: ['management'],
    createdAt: '2024-01-14T14:00:00Z',
    employee_uuid: 'emp2',
    sentiment_label: 'neutral',
    sentiment_score: 0.1,
    city: 'Delhi',
    cluster: 'North',
    role: 'manager',
    employee_name: 'Jane Smith'
  }
];

const mockAlerts: SentimentAlert[] = [
  {
    id: '1',
    type: 'low_rating',
    message: 'Low average rating detected',
    severity: 'high',
    createdAt: '2024-01-15T10:00:00Z',
    resolved: false,
    trigger_reason: 'Average rating below 2.5',
    city: 'Mumbai',
    cluster: 'West',
    role: 'agent',
    average_score: 2.1,
    change_percentage: -15.5
  }
];

export const fetchAllSentiment = async (filters: SentimentFilters = {}): Promise<SentimentEntry[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockSentimentData;
};

export const submitSentiment = async (data: {
  rating: number;
  feedback_text?: string;
  employee_uuid: string;
  tags?: string[];
}): Promise<SentimentEntry> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newEntry: SentimentEntry = {
    id: Date.now().toString(),
    rating: data.rating,
    feedback_text: data.feedback_text,
    tags: data.tags,
    createdAt: new Date().toISOString(),
    employee_uuid: data.employee_uuid
  };
  
  return newEntry;
};

export const getSentimentAnalytics = async (filters: SentimentFilters = {}) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    averageRating: 3.8,
    totalResponses: 150,
    sentimentDistribution: {
      happy: 65,
      neutral: 25,
      sad: 10
    }
  };
};

export const getSentimentTrends = async (period: 'daily' | 'weekly' | 'monthly', filters: SentimentFilters = {}) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    { date: '2024-01-01', happy: 65, neutral: 25, sad: 10 },
    { date: '2024-01-02', happy: 70, neutral: 20, sad: 10 },
    { date: '2024-01-03', happy: 60, neutral: 30, sad: 10 }
  ];
};

export const fetchSentimentAlerts = async (showResolved?: boolean): Promise<SentimentAlert[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return showResolved ? mockAlerts.filter(alert => alert.resolved) : mockAlerts.filter(alert => !alert.resolved);
};

export const resolveSentimentAlert = async (alertId: string): Promise<void> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`Alert ${alertId} marked as resolved`);
};

export const markAlertAsResolved = async (alertId: string): Promise<void> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`Alert ${alertId} marked as resolved`);
};
