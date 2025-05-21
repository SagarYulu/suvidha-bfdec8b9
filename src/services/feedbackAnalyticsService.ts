
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
  try {
    const response = await fetch('/api/analytics/cities');
    if (!response.ok) {
      throw new Error(`Failed to fetch cities: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const getClusters = async (city?: string): Promise<string[]> => {
  try {
    const url = city ? `/api/analytics/clusters?city=${encodeURIComponent(city)}` : '/api/analytics/clusters';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch clusters: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching clusters:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const getFeedbackOverview = async (filters: FeedbackFilters): Promise<FeedbackOverview> => {
  try {
    const response = await fetch('/api/analytics/feedback/overview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch feedback overview: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching feedback overview:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const getResolverLeaderboard = async (filters: FeedbackFilters): Promise<ResolverStats[]> => {
  try {
    const response = await fetch('/api/analytics/feedback/resolvers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch resolver leaderboard: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching resolver leaderboard:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const getCategoryAnalysis = async (filters: FeedbackFilters): Promise<CategoryStats[]> => {
  try {
    const response = await fetch('/api/analytics/feedback/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch category analysis: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching category analysis:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const getFeedbackTrends = async (filters: FeedbackFilters): Promise<TrendPoint[]> => {
  try {
    const response = await fetch('/api/analytics/feedback/trends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch feedback trends: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching feedback trends:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
