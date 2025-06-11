
import { SentimentAlert, SentimentEntry } from '@/types';

export interface SentimentFilters {
  startDate?: string;
  endDate?: string;
  city?: string;
  cluster?: string;
  role?: string;
}

// Mock data
const mockSentimentData: SentimentEntry[] = [
  {
    id: '1',
    rating: 4,
    feedback_text: 'Great work environment',
    tags: ['work-environment'],
    createdAt: '2024-01-15T10:00:00Z',
    employee_uuid: 'emp1'
  },
  {
    id: '2',
    rating: 3,
    feedback_text: 'Could be better',
    tags: ['management'],
    createdAt: '2024-01-14T14:00:00Z',
    employee_uuid: 'emp2'
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

export const fetchSentimentAlerts = async (): Promise<SentimentAlert[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      id: '1',
      type: 'low_rating',
      message: 'Low average rating detected',
      severity: 'high',
      createdAt: '2024-01-15T10:00:00Z',
      resolved: false
    }
  ];
};

export const markAlertAsResolved = async (alertId: string): Promise<void> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`Alert ${alertId} marked as resolved`);
};
