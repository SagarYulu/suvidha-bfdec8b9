
// Sentiment analysis types for frontend
export interface SentimentEntry {
  id: string;
  employee_uuid: string;
  employee_name?: string;
  feedback_text?: string;
  sentiment_label?: 'positive' | 'negative' | 'neutral';
  sentiment_score?: number;
  rating: number;
  city?: string;
  cluster?: string;
  role?: string;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

export interface SentimentAlert {
  id: string;
  type: string;
  trigger_reason?: string;
  city?: string;
  cluster?: string;
  role?: string;
  average_score?: number;
  change_percentage?: number;
  resolved?: boolean;
  is_resolved?: boolean;
  created_at: string;
  createdAt?: string;
}

export interface SentimentFilters {
  startDate?: string;
  endDate?: string;
  city?: string;
  cluster?: string;
  role?: string;
  comparisonMode?: 'none' | 'previous_period' | 'previous_month' | 'previous_quarter';
}
