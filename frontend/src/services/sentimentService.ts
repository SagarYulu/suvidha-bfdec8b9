
// Sentiment service for the frontend
export interface SentimentEntry {
  id: string;
  rating: number;
  feedback_text?: string;
  tags?: string[];
  createdAt: string;
  employee_uuid: string;
  created_at?: string;
  sentiment_label?: string;
  sentiment_score?: number;
  city?: string;
  cluster?: string;
  role?: string;
  feedback?: string;
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

// Placeholder functions to prevent build errors
export const fetchAllSentiment = async (filters?: any): Promise<SentimentEntry[]> => {
  return [];
};

export const fetchSentimentAlerts = async (showResolved?: boolean): Promise<SentimentAlert[]> => {
  return [];
};

export const resolveSentimentAlert = async (alertId: string): Promise<void> => {
  // Implementation pending
};

export const generateTestSentimentData = async (): Promise<void> => {
  // Implementation pending
};
