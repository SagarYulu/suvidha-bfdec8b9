
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

// Helper function to check response
async function checkResponse(response: Response, endpoint: string) {
  // First, check if the response is OK
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText || response.statusText} from ${endpoint}`);
  }

  // Then, check if the response is JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const errorText = await response.text();
    throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}. Response: ${errorText.substring(0, 100)}... from ${endpoint}`);
  }

  return response;
}

// API functions that throw errors instead of falling back to mock data
export const getCities = async (): Promise<string[]> => {
  const endpoint = '/api/analytics/cities';
  try {
    const response = await fetch(endpoint);
    await checkResponse(response, endpoint);
    return await response.json();
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const getClusters = async (city?: string): Promise<string[]> => {
  const url = city ? `/api/analytics/clusters?city=${encodeURIComponent(city)}` : '/api/analytics/clusters';
  try {
    const response = await fetch(url);
    await checkResponse(response, url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching clusters:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const getFeedbackOverview = async (filters: FeedbackFilters): Promise<FeedbackOverview> => {
  const endpoint = '/api/analytics/feedback/overview';
  try {
    console.log("Fetching overview with filters:", JSON.stringify(filters));
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    
    await checkResponse(response, endpoint);
    return await response.json();
  } catch (error) {
    console.error('Error fetching feedback overview:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const getResolverLeaderboard = async (filters: FeedbackFilters): Promise<ResolverStats[]> => {
  const endpoint = '/api/analytics/feedback/resolvers';
  try {
    console.log("Fetching resolver data with filters:", JSON.stringify(filters));
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    
    await checkResponse(response, endpoint);
    return await response.json();
  } catch (error) {
    console.error('Error fetching resolver leaderboard:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const getCategoryAnalysis = async (filters: FeedbackFilters): Promise<CategoryStats[]> => {
  const endpoint = '/api/analytics/feedback/categories';
  try {
    console.log("Fetching category data with filters:", JSON.stringify(filters));
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    
    await checkResponse(response, endpoint);
    return await response.json();
  } catch (error) {
    console.error('Error fetching category analysis:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

export const getFeedbackTrends = async (filters: FeedbackFilters): Promise<TrendPoint[]> => {
  const endpoint = '/api/analytics/feedback/trends';
  try {
    console.log("Fetching trends with filters:", JSON.stringify(filters));
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    
    await checkResponse(response, endpoint);
    return await response.json();
  } catch (error) {
    console.error('Error fetching feedback trends:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
