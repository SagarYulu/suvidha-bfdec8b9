
import { Issue } from '@/types';

export interface SentimentAlert {
  id: string;
  type: 'low_rating' | 'negative_sentiment' | 'high_volume';
  message: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
  created_at?: string;
  resolved: boolean;
  is_resolved?: boolean;
  trigger_reason?: string;
  city?: string;
  cluster?: string;
  role?: string;
  average_score?: number;
  change_percentage?: number;
}

export interface SentimentEntry {
  id: string;
  employee_uuid: string;
  employee_name?: string;
  rating: number;
  feedback_text?: string;
  sentiment_label?: string;
  sentiment_score?: number;
  city?: string;
  cluster?: string;
  role?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface SentimentFilters {
  startDate?: string;
  endDate?: string;
  city?: string;
  cluster?: string;
  role?: string;
  comparisonMode?: string;
}

export interface SentimentAnalytics {
  averageRating: number;
  totalEntries: number;
  sentimentDistribution: Record<string, number>;
  trends: any[];
}

// Mock data for testing
const mockSentimentData: SentimentEntry[] = [
  {
    id: '1',
    employee_uuid: 'emp-001',
    employee_name: 'John Doe',
    rating: 4,
    feedback_text: 'Good working environment',
    sentiment_label: 'positive',
    sentiment_score: 0.8,
    city: 'Bangalore',
    cluster: 'South',
    role: 'Developer',
    tags: ['Work Environment'],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    employee_uuid: 'emp-002',
    employee_name: 'Jane Smith',
    rating: 2,
    feedback_text: 'Need better management',
    sentiment_label: 'negative',
    sentiment_score: 0.3,
    city: 'Delhi',
    cluster: 'North',
    role: 'Manager',
    tags: ['Management'],
    createdAt: new Date().toISOString()
  }
];

const mockSentimentAlerts: SentimentAlert[] = [
  {
    id: '1',
    type: 'low_rating',
    message: 'Low rating detected in Bangalore office',
    severity: 'high',
    createdAt: new Date().toISOString(),
    resolved: false,
    trigger_reason: 'Average rating below 2.5',
    city: 'Bangalore',
    cluster: 'South',
    average_score: 2.1,
    change_percentage: -15.2
  }
];

export const fetchAllSentiment = async (filters: SentimentFilters = {}): Promise<SentimentEntry[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredData = [...mockSentimentData];
  
  if (filters.city) {
    filteredData = filteredData.filter(item => 
      item.city?.toLowerCase().includes(filters.city!.toLowerCase())
    );
  }
  
  if (filters.cluster) {
    filteredData = filteredData.filter(item => 
      item.cluster?.toLowerCase().includes(filters.cluster!.toLowerCase())
    );
  }
  
  if (filters.role) {
    filteredData = filteredData.filter(item => 
      item.role?.toLowerCase().includes(filters.role!.toLowerCase())
    );
  }
  
  return filteredData;
};

export const submitSentiment = async (data: {
  rating: number;
  feedback_text?: string;
  employee_uuid: string;
  tags?: string[];
}): Promise<SentimentEntry> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newEntry: SentimentEntry = {
    id: `sentiment-${Date.now()}`,
    employee_uuid: data.employee_uuid,
    rating: data.rating,
    feedback_text: data.feedback_text,
    tags: data.tags,
    sentiment_label: data.rating >= 4 ? 'positive' : data.rating <= 2 ? 'negative' : 'neutral',
    sentiment_score: data.rating / 5,
    createdAt: new Date().toISOString()
  };
  
  mockSentimentData.push(newEntry);
  return newEntry;
};

export const getSentimentAnalytics = async (filters: SentimentFilters = {}): Promise<SentimentAnalytics> => {
  const data = await fetchAllSentiment(filters);
  
  const averageRating = data.length > 0 
    ? data.reduce((sum, item) => sum + item.rating, 0) / data.length 
    : 0;
    
  const sentimentDistribution = data.reduce((acc, item) => {
    const sentiment = item.sentiment_label || 'neutral';
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    averageRating,
    totalEntries: data.length,
    sentimentDistribution,
    trends: []
  };
};

export const getSentimentTrends = async (period: string, filters: SentimentFilters = {}): Promise<any[]> => {
  // Mock implementation
  return [];
};

export const fetchSentimentAlerts = async (showResolved: boolean = false): Promise<SentimentAlert[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return mockSentimentAlerts.filter(alert => 
    showResolved ? alert.resolved : !alert.resolved
  );
};

export const resolveSentimentAlert = async (alertId: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const alert = mockSentimentAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.resolved = true;
  }
};

export const generateTestSentimentData = async (): Promise<void> => {
  // Mock implementation for test data generation
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Test sentiment data generated');
};
