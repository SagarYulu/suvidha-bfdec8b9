
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

// Mock data for when API calls fail
const MOCK_DATA = {
  overview: {
    averageRating: 4.2,
    changePercentage: 5.3,
    submissionRate: {
      percentage: 68.5,
      withFeedback: 137,
      total: 200,
      changePercentage: 2.8
    },
    ratingDistribution: [
      { rating: 1, count: 5, percentage: 3.6 },
      { rating: 2, count: 8, percentage: 5.8 },
      { rating: 3, count: 15, percentage: 10.9 },
      { rating: 4, count: 42, percentage: 30.7 },
      { rating: 5, count: 67, percentage: 48.9 }
    ]
  },
  resolvers: [
    {
      id: "res1",
      name: "Alex Johnson",
      avgRating: 4.8,
      changePercentage: 3.2,
      feedbackCount: 45,
      veryHappy: 68,
      happy: 22,
      neutral: 7,
      unhappy: 2,
      veryUnhappy: 1
    },
    {
      id: "res2",
      name: "Sarah Williams",
      avgRating: 4.5,
      changePercentage: 1.8,
      feedbackCount: 32,
      veryHappy: 56,
      happy: 28,
      neutral: 10,
      unhappy: 4,
      veryUnhappy: 2
    },
    {
      id: "res3",
      name: "Michael Brown",
      avgRating: 4.2,
      changePercentage: -0.5,
      feedbackCount: 28,
      veryHappy: 48,
      happy: 32,
      neutral: 12,
      unhappy: 6,
      veryUnhappy: 2
    }
  ],
  categories: [
    {
      name: "Salary",
      rating: 4.3,
      changePercentage: 2.1,
      veryHappy: 52,
      happy: 30,
      neutral: 10,
      unhappy: 5,
      veryUnhappy: 3
    },
    {
      name: "PF",
      rating: 4.1,
      changePercentage: 1.5,
      veryHappy: 45,
      happy: 35,
      neutral: 12,
      unhappy: 6,
      veryUnhappy: 2
    },
    {
      name: "ESI",
      rating: 3.9,
      changePercentage: -1.2,
      veryHappy: 40,
      happy: 32,
      neutral: 15,
      unhappy: 8,
      veryUnhappy: 5
    },
    {
      name: "Leave",
      rating: 4.5,
      changePercentage: 3.8,
      veryHappy: 60,
      happy: 25,
      neutral: 10,
      unhappy: 3,
      veryUnhappy: 2
    }
  ],
  trends: Array.from({ length: 12 }, (_, i) => ({
    period: `Month ${i + 1}`,
    rating: 3.5 + Math.random() * 1.5,
    submissions: 20 + Math.floor(Math.random() * 30)
  }))
};

// Helper function to check response
async function checkResponse(response: Response, endpoint: string) {
  // First, check if the response is OK
  if (!response.ok) {
    let errorText;
    try {
      // Try to get error text as JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorJson = await response.json();
        errorText = JSON.stringify(errorJson);
      } else {
        // If not JSON, get as text
        errorText = await response.text();
      }
    } catch (e) {
      // If we can't parse the response, just use status text
      errorText = response.statusText;
    }
    
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

// Helper function to handle API calls with appropriate error logging
async function apiCall<T>(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<T> {
  try {
    const options: RequestInit = {
      method,
      headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    };
    
    console.log(`Calling ${endpoint} with method ${method}`, body ? `and body: ${JSON.stringify(body)}` : '');
    const response = await fetch(endpoint);
    await checkResponse(response, endpoint);
    return await response.json();
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    throw error;
  }
}

// API functions that now use mock data as fallback when specified
export const getCities = async (useMockOnError: boolean = false): Promise<string[]> => {
  const endpoint = '/api/analytics/cities';
  try {
    const response = await fetch(endpoint);
    await checkResponse(response, endpoint);
    return await response.json();
  } catch (error) {
    console.error('Error fetching cities:', error);
    if (useMockOnError) {
      console.warn('Using mock cities data');
      return ["New York", "San Francisco", "Chicago", "Los Angeles", "Miami"];
    }
    throw error;
  }
};

export const getClusters = async (city?: string, useMockOnError: boolean = false): Promise<string[]> => {
  const url = city ? `/api/analytics/clusters?city=${encodeURIComponent(city)}` : '/api/analytics/clusters';
  try {
    const response = await fetch(url);
    await checkResponse(response, url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching clusters:', error);
    if (useMockOnError) {
      console.warn('Using mock clusters data');
      return ["Downtown", "Midtown", "Uptown", "Westside", "Eastside"];
    }
    throw error;
  }
};

export const getFeedbackOverview = async (filters: FeedbackFilters, useMockOnError: boolean = false): Promise<FeedbackOverview> => {
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
    if (useMockOnError) {
      console.warn('Using mock overview data');
      return MOCK_DATA.overview;
    }
    throw error;
  }
};

export const getResolverLeaderboard = async (filters: FeedbackFilters, useMockOnError: boolean = false): Promise<ResolverStats[]> => {
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
    if (useMockOnError) {
      console.warn('Using mock resolver data');
      return MOCK_DATA.resolvers;
    }
    throw error;
  }
};

export const getCategoryAnalysis = async (filters: FeedbackFilters, useMockOnError: boolean = false): Promise<CategoryStats[]> => {
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
    if (useMockOnError) {
      console.warn('Using mock category data');
      return MOCK_DATA.categories;
    }
    throw error;
  }
};

export const getFeedbackTrends = async (filters: FeedbackFilters, useMockOnError: boolean = false): Promise<TrendPoint[]> => {
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
    if (useMockOnError) {
      console.warn('Using mock trends data');
      return MOCK_DATA.trends;
    }
    throw error;
  }
};
