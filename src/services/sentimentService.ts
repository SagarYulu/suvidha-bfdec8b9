
import { apiCall } from '@/config/api';

export interface SentimentEntry {
  id: string;
  rating: number;
  feedback_text?: string;
  sentiment_label?: string;
  sentiment_score?: number;
  tags?: string[];
  created_at: string;
  employee_uuid?: string;
  employee_name?: string;
  city?: string;
  cluster?: string;
  role?: string;
}

export interface SentimentAlert {
  id: string;
  type: 'low_rating' | 'negative_trend' | 'urgent_feedback';
  message: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
  resolved: boolean;
  is_resolved?: boolean;
  created_at?: string;
  trigger_reason?: string;
  city?: string;
  cluster?: string;
  role?: string;
  average_score?: number;
  change_percentage?: number;
}

export interface SentimentFilters {
  startDate?: string;
  endDate?: string;
  city?: string;
  cluster?: string;
  role?: string;
  rating?: number;
  sentiment?: string;
}

export const fetchAllSentiment = async (filters?: SentimentFilters): Promise<SentimentEntry[]> => {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const url = `/sentiment${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await apiCall(url);
};

export const submitSentiment = async (data: {
  rating: number;
  feedback_text?: string;
  employee_uuid: string;
  tags?: string[];
}): Promise<SentimentEntry> => {
  return await apiCall('/sentiment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

export const getSentimentAnalytics = async (filters?: SentimentFilters) => {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const url = `/sentiment/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await apiCall(url);
};

export const getSentimentTrends = async (
  period: 'daily' | 'weekly' | 'monthly' = 'weekly',
  filters?: SentimentFilters
) => {
  const queryParams = new URLSearchParams();
  queryParams.append('period', period);
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const url = `/sentiment/trends?${queryParams.toString()}`;
  return await apiCall(url);
};

export const fetchSentimentAlerts = async (showResolved: boolean = false): Promise<SentimentAlert[]> => {
  const queryParams = new URLSearchParams();
  if (showResolved) {
    queryParams.append('resolved', 'true');
  }
  const url = `/sentiment/alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await apiCall(url);
};

export const resolveSentimentAlert = async (alertId: string): Promise<void> => {
  await apiCall(`/sentiment/alerts/${alertId}/resolve`, {
    method: 'POST',
  });
};
