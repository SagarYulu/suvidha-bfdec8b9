
import { supabase } from "@/integrations/supabase/client";

// Types
export interface FeedbackFilters {
  city?: string;
  cluster?: string;
  resolver?: string;
  category?: string;
  feedbackType?: 'agent' | 'solution' | 'both';
  startDate?: string;
  endDate?: string;
  comparisonMode?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface FeedbackOverview {
  averageRating: number;
  previousAverageRating: number;
  changePercentage: number;
  totalSubmissions: number;
  previousTotalSubmissions: number;
  submissionChangePercentage: number;
  ratingDistribution: RatingDistribution[];
  submissionRate: {
    total: number;
    withFeedback: number;
    percentage: number;
    previousPercentage: number;
    changePercentage: number;
  };
}

export interface ResolverStats {
  id: string;
  name: string;
  avgRating: number;
  previousAvgRating: number;
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
  previousRating: number;
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

// Main service functions
export const getFeedbackOverview = async (filters: FeedbackFilters): Promise<FeedbackOverview> => {
  try {
    // This would be a real implementation that queries the database
    // For now, return mock data to demonstrate the UI
    return {
      averageRating: 4.2,
      previousAverageRating: 3.9,
      changePercentage: 7.69,
      totalSubmissions: 150,
      previousTotalSubmissions: 120,
      submissionChangePercentage: 25,
      ratingDistribution: [
        { rating: 5, count: 45, percentage: 30 },
        { rating: 4, count: 30, percentage: 20 },
        { rating: 3, count: 15, percentage: 10 },
        { rating: 2, count: 7, percentage: 4.7 },
        { rating: 1, count: 3, percentage: 2 }
      ],
      submissionRate: {
        total: 250,
        withFeedback: 150,
        percentage: 60,
        previousPercentage: 55,
        changePercentage: 9.1
      }
    };
  } catch (error) {
    console.error("Error fetching feedback overview:", error);
    throw error;
  }
};

export const getResolverLeaderboard = async (filters: FeedbackFilters): Promise<ResolverStats[]> => {
  try {
    // In a real implementation, this would query the database
    // For now, return mock data
    return [
      { 
        id: "001", 
        name: "John Doe", 
        avgRating: 4.8, 
        previousAvgRating: 4.7,
        changePercentage: 2.1,
        feedbackCount: 52, 
        veryHappy: 80, 
        happy: 15, 
        neutral: 5, 
        unhappy: 0, 
        veryUnhappy: 0 
      },
      { 
        id: "002", 
        name: "Jane Smith", 
        avgRating: 4.5, 
        previousAvgRating: 4.2,
        changePercentage: 7.1,
        feedbackCount: 48, 
        veryHappy: 70, 
        happy: 20, 
        neutral: 5, 
        unhappy: 5, 
        veryUnhappy: 0 
      },
      { 
        id: "003", 
        name: "Bob Johnson", 
        avgRating: 3.9, 
        previousAvgRating: 4.0,
        changePercentage: -2.5,
        feedbackCount: 35, 
        veryHappy: 40, 
        happy: 30, 
        neutral: 20, 
        unhappy: 5, 
        veryUnhappy: 5 
      }
    ];
  } catch (error) {
    console.error("Error fetching resolver leaderboard:", error);
    throw error;
  }
};

export const getCategoryAnalysis = async (filters: FeedbackFilters): Promise<CategoryStats[]> => {
  try {
    // In a real implementation, this would query the database
    // For now, return mock data
    return [
      { 
        name: "PF", 
        rating: 4.2, 
        previousRating: 4.0,
        changePercentage: 5.0,
        veryHappy: 60, 
        happy: 20, 
        neutral: 10, 
        unhappy: 5, 
        veryUnhappy: 5 
      },
      { 
        name: "ESI", 
        rating: 3.8, 
        previousRating: 3.5,
        changePercentage: 8.6,
        veryHappy: 40, 
        happy: 30, 
        neutral: 15, 
        unhappy: 10, 
        veryUnhappy: 5 
      },
      { 
        name: "Salary", 
        rating: 4.5, 
        previousRating: 4.4,
        changePercentage: 2.3,
        veryHappy: 70, 
        happy: 20, 
        neutral: 5, 
        unhappy: 5, 
        veryUnhappy: 0 
      },
      { 
        name: "Leave", 
        rating: 3.9, 
        previousRating: 4.1,
        changePercentage: -4.9,
        veryHappy: 45, 
        happy: 25, 
        neutral: 15, 
        unhappy: 10, 
        veryUnhappy: 5 
      }
    ];
  } catch (error) {
    console.error("Error fetching category analysis:", error);
    throw error;
  }
};

export const getFeedbackTrends = async (filters: FeedbackFilters): Promise<TrendPoint[]> => {
  try {
    // In a real implementation, this would query the database
    // For now, generate mock data based on the comparison mode
    const periods = [];
    let format = "";
    
    switch (filters.comparisonMode) {
      case 'day':
        format = 'D MMM';
        for (let i = 0; i < 14; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          periods.push(date.toISOString().split('T')[0]);
        }
        break;
      case 'week':
        format = 'W';
        for (let i = 0; i < 12; i++) {
          periods.push(`Week ${i + 1}`);
        }
        break;
      case 'month':
        format = 'MMM';
        for (let i = 0; i < 12; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          periods.push(new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date));
        }
        break;
      case 'quarter':
        format = 'Q';
        for (let i = 0; i < 8; i++) {
          periods.push(`Q${(4 - (i % 4)) || 4} ${new Date().getFullYear() - Math.floor(i / 4)}`);
        }
        break;
      case 'year':
        format = 'YYYY';
        for (let i = 0; i < 5; i++) {
          periods.push(`${new Date().getFullYear() - i}`);
        }
        break;
      default:
        for (let i = 0; i < 12; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          periods.push(new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date));
        }
    }

    // Generate mock trend data
    return periods.map((period, i) => ({
      period,
      rating: 3.5 + Math.random() * 1.5,
      submissions: Math.floor(Math.random() * 50) + 30
    })).reverse();
  } catch (error) {
    console.error("Error fetching feedback trends:", error);
    throw error;
  }
};
