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
