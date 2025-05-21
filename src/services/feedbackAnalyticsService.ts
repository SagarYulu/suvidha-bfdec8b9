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

// Mocked API functions
export const getCities = async (): Promise<string[]> => {
  try {
    // Attempt to fetch real data from API
    const response = await fetch('/api/analytics/cities');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Error fetching cities, falling back to mock data:", error);
  }
  
  // Fallback to mock data
  return ["Bangalore", "Mumbai", "Delhi", "Chennai", "Hyderabad"];
};

export const getClusters = async (city?: string): Promise<string[]> => {
  try {
    // Attempt to fetch real data from API
    const url = city ? `/api/analytics/clusters?city=${encodeURIComponent(city)}` : '/api/analytics/clusters';
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Error fetching clusters, falling back to mock data:", error);
  }
  
  // Fallback to mock data based on city
  if (city === "Bangalore") {
    return ["Electronic City", "Whitefield", "Koramangala", "Indiranagar"];
  } else if (city === "Mumbai") {
    return ["Andheri", "Powai", "BKC"];
  } else {
    return ["North", "South", "East", "West", "Central"];
  }
};

export const getFeedbackOverview = async (filters: FeedbackFilters): Promise<FeedbackOverview> => {
  try {
    // Attempt to fetch real data from API
    const response = await fetch('/api/analytics/feedback/overview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters)
    });
    
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("Error fetching feedback overview, falling back to mock data:", error);
  }
  
  // Simulate API delay before returning mock data
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log("Using mock data for feedback overview with filters:", filters);
  
  // Mock data
  return {
    averageRating: 4.2,
    changePercentage: 5.3,
    submissionRate: {
      percentage: 78.5,
      withFeedback: 157,
      total: 200,
      changePercentage: 2.8
    },
    ratingDistribution: [
      { rating: 5, count: 78, percentage: 49.7 },
      { rating: 4, count: 45, percentage: 28.7 },
      { rating: 3, count: 20, percentage: 12.7 },
      { rating: 2, count: 10, percentage: 6.4 },
      { rating: 1, count: 4, percentage: 2.5 }
    ]
  };
};

export const getResolverLeaderboard = async (filters: FeedbackFilters): Promise<ResolverStats[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  console.log("Fetching resolver leaderboard with filters:", filters);
  
  // Mock implementation - would be replaced with actual API call
  return [
    {
      id: "1",
      name: "Priya Sharma",
      avgRating: 4.8,
      changePercentage: 2.1,
      feedbackCount: 42,
      veryHappy: 85,
      happy: 10,
      neutral: 5,
      unhappy: 0,
      veryUnhappy: 0
    },
    {
      id: "2",
      name: "Rahul Verma",
      avgRating: 4.5,
      changePercentage: 1.5,
      feedbackCount: 38,
      veryHappy: 65,
      happy: 25,
      neutral: 10,
      unhappy: 0,
      veryUnhappy: 0
    },
    {
      id: "3",
      name: "Ananya Patel",
      avgRating: 4.2,
      changePercentage: -0.3,
      feedbackCount: 36,
      veryHappy: 55,
      happy: 25,
      neutral: 10,
      unhappy: 10,
      veryUnhappy: 0
    },
    {
      id: "4",
      name: "Vikram Singh",
      avgRating: 3.9,
      changePercentage: 0.8,
      feedbackCount: 32,
      veryHappy: 40,
      happy: 30,
      neutral: 15,
      unhappy: 10,
      veryUnhappy: 5
    }
  ];
};

export const getCategoryAnalysis = async (filters: FeedbackFilters): Promise<CategoryStats[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  console.log("Fetching category analysis with filters:", filters);
  
  // Mock implementation - would be replaced with actual API call
  return [
    {
      name: "Salary",
      rating: 4.5,
      changePercentage: 2.2,
      veryHappy: 68,
      happy: 22,
      neutral: 7,
      unhappy: 3,
      veryUnhappy: 0
    },
    {
      name: "Leave",
      rating: 4.3,
      changePercentage: 1.7,
      veryHappy: 58,
      happy: 25,
      neutral: 12,
      unhappy: 5,
      veryUnhappy: 0
    },
    {
      name: "ESI",
      rating: 3.9,
      changePercentage: -0.5,
      veryHappy: 42,
      happy: 28,
      neutral: 15,
      unhappy: 10,
      veryUnhappy: 5
    },
    {
      name: "PF",
      rating: 3.7,
      changePercentage: 0.8,
      veryHappy: 35,
      happy: 30,
      neutral: 20,
      unhappy: 10,
      veryUnhappy: 5
    }
  ];
};

export const getFeedbackTrends = async (filters: FeedbackFilters): Promise<TrendPoint[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  console.log("Fetching feedback trends with filters:", filters);
  
  const trendData = [];
  const baseDate = new Date();
  
  // Generate 12 data points (e.g., for months or weeks)
  for (let i = 0; i < 12; i++) {
    const date = new Date(baseDate);
    date.setMonth(baseDate.getMonth() - (11 - i));
    
    trendData.push({
      period: date.toLocaleString('default', { month: 'short' }),
      rating: 3.5 + (Math.random() * 1.5),
      submissions: Math.floor(Math.random() * 50) + 20
    });
  }
  
  return trendData;
};
