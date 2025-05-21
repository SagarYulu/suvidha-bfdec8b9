
import { supabase } from "@/integrations/supabase/client";

export interface FeedbackStats {
  averageRating: number;
  totalFeedback: number;
  feedbackReceived: number;
  feedbackPercentage: number;
  ratingCounts: {
    [key: number]: number;
  };
}

export interface ResolverStats {
  resolverUuid: string;
  resolverName: string;
  averageRating: number;
  totalTickets: number;
  feedbackReceived: number;
}

export interface FeedbackMetadata {
  category?: 'agent' | 'resolution' | null;
  reason?: string | null;
}

// Check if feedback exists for a ticket - modified to always return false since functionality is removed
export const checkFeedbackExists = async (ticketId: string): Promise<boolean> => {
  console.log("Feedback functionality has been removed");
  return false;
};

// Fetch feedback stats - modified to return empty data since functionality is removed
export const getFeedbackStats = async (filters: {
  city?: string;
  cluster?: string;
  resolverUuid?: string;
  startDate?: string;
  endDate?: string;
  ticketCategory?: string;
}): Promise<FeedbackStats> => {
  console.log("Feedback functionality has been removed");
  
  return {
    averageRating: 0,
    totalFeedback: 0,
    feedbackReceived: 0,
    feedbackPercentage: 0,
    ratingCounts: {}
  };
};

// Get resolver leaderboard - modified to return empty data since functionality is removed
export const getResolverLeaderboard = async (filters: {
  city?: string;
  cluster?: string;
  startDate?: string;
  endDate?: string;
  ticketCategory?: string;
}): Promise<ResolverStats[]> => {
  console.log("Feedback functionality has been removed");
  return [];
};
