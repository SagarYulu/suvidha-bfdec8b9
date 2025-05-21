
import { DateRange } from "react-day-picker";

// Types for filter parameters
export interface FeedbackFilters {
  city?: string;
  cluster?: string;
  resolver?: string;
  category?: string;
  feedbackType?: "agent" | "resolution" | "both";
  comparisonMode?: "day" | "week" | "month" | "quarter" | "year";
  dateRange?: {
    start: string;
    end: string;
  };
  startDate?: string;
  endDate?: string;
}

// Types for API responses
export interface FeedbackOverview {
  averageRating: number;
  changePercentage: number;
  submissionRate: {
    percentage: number;
    withFeedback: number;
    total: number;
    changePercentage: number;
  };
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
}

export interface ResolverStats {
  id: string;
  name: string;
  avgRating: number;
  changePercentage: number;
  feedbackCount: number;
  veryHappy: number;
  happy: number;
  neutral: number;
  unhappy: number;
  veryUnhappy: number;
}

export interface CategoryStats {
  name: string;
  rating: number;
  changePercentage: number;
  veryHappy: number;
  happy: number;
  neutral: number;
  unhappy: number;
  veryUnhappy: number;
}

export interface TrendPoint {
  period: string;
  rating: number;
  submissions: number;
}

// API functions that throw errors instead of falling back to mock data
export const getCities = async (): Promise<string[]> => {
  const response = await fetch('/api/analytics/cities');
  if (!response.ok) {
    throw new Error(`Failed to fetch cities: ${response.status} ${response.statusText}`);
  }
  return await response.json();
};

export const getClusters = async (city?: string): Promise<string[]> => {
  const url = city ? `/api/analytics/clusters?city=${encodeURIComponent(city)}` : '/api/analytics/clusters';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch clusters: ${response.status} ${response.statusText}`);
  }
  return await response.json();
};

export const getFeedbackOverview = async (filters: FeedbackFilters): Promise<FeedbackOverview> => {
  const response = await fetch('/api/analytics/feedback/overview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch feedback overview: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
};

export const getResolverLeaderboard = async (filters: FeedbackFilters): Promise<ResolverStats[]> => {
  const response = await fetch('/api/analytics/feedback/resolvers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch resolver leaderboard: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
};

export const getCategoryAnalysis = async (filters: FeedbackFilters): Promise<CategoryStats[]> => {
  const response = await fetch('/api/analytics/feedback/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch category analysis: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
};

export const getFeedbackTrends = async (filters: FeedbackFilters): Promise<TrendPoint[]> => {
  const response = await fetch('/api/analytics/feedback/trends', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch feedback trends: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
};
