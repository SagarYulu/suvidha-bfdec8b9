
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

// Check if feedback exists for a ticket
export const checkFeedbackExists = async (ticketId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('resolution_feedback')
      .select('id')
      .eq('ticket_id', ticketId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error("Error checking feedback:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error checking feedback existence:", error);
    return false;
  }
};

// Fetch feedback stats
export const getFeedbackStats = async (filters: {
  city?: string;
  cluster?: string;
  resolverUuid?: string;
  startDate?: string;
  endDate?: string;
  ticketCategory?: string;
}): Promise<FeedbackStats> => {
  try {
    // First get all tickets that match the filters
    let query = supabase
      .from('issues')
      .select('id, resolver_uuid:assigned_to')
      .eq('status', 'closed');
    
    if (filters.city) {
      // Would need to join with employees table to filter by city
      // This is a simplified example
    }
    
    if (filters.ticketCategory) {
      query = query.eq('type_id', filters.ticketCategory);
    }
    
    if (filters.startDate) {
      query = query.gte('closed_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('closed_at', filters.endDate);
    }

    const { data: tickets, error: ticketsError } = await query;
    
    if (ticketsError) {
      console.error("Error fetching tickets:", ticketsError);
      return {
        averageRating: 0,
        totalFeedback: 0,
        feedbackReceived: 0,
        feedbackPercentage: 0,
        ratingCounts: {}
      };
    }
    
    // Get feedback for these tickets
    const ticketIds = tickets.map(ticket => ticket.id);
    
    if (ticketIds.length === 0) {
      return {
        averageRating: 0,
        totalFeedback: 0,
        feedbackReceived: 0,
        feedbackPercentage: 0,
        ratingCounts: {}
      };
    }
    
    const { data: feedbacks, error: feedbackError } = await supabase
      .from('resolution_feedback')
      .select('ticket_id, rating')
      .in('ticket_id', ticketIds);
    
    if (feedbackError) {
      console.error("Error fetching feedback:", feedbackError);
      return {
        averageRating: 0,
        totalFeedback: 0,
        feedbackReceived: 0,
        feedbackPercentage: 0,
        ratingCounts: {}
      };
    }
    
    // Calculate stats
    const totalTickets = tickets.length;
    const feedbackCount = feedbacks?.length || 0;
    const feedbackPercentage = totalTickets > 0 ? (feedbackCount / totalTickets) * 100 : 0;
    
    // Calculate average rating
    const totalRating = feedbacks?.reduce((sum, feedback) => sum + feedback.rating, 0) || 0;
    const averageRating = feedbackCount > 0 ? totalRating / feedbackCount : 0;
    
    // Count ratings
    const ratingCounts: { [key: number]: number } = {};
    for (let i = 1; i <= 5; i++) {
      ratingCounts[i] = feedbacks?.filter(f => f.rating === i).length || 0;
    }
    
    return {
      averageRating,
      totalFeedback: totalTickets,
      feedbackReceived: feedbackCount,
      feedbackPercentage,
      ratingCounts
    };
  } catch (error) {
    console.error("Error getting feedback stats:", error);
    return {
      averageRating: 0,
      totalFeedback: 0,
      feedbackReceived: 0,
      feedbackPercentage: 0,
      ratingCounts: {}
    };
  }
};

// Get resolver leaderboard
export const getResolverLeaderboard = async (filters: {
  city?: string;
  cluster?: string;
  startDate?: string;
  endDate?: string;
  ticketCategory?: string;
}): Promise<ResolverStats[]> => {
  try {
    // This is a complex query that would require joining multiple tables
    // This is a simplified version
    const { data: resolvers, error: resolversError } = await supabase.rpc(
      'get_resolver_feedback_stats',
      { 
        start_date: filters.startDate,
        end_date: filters.endDate,
        ticket_type: filters.ticketCategory 
      }
    );
    
    if (resolversError) {
      console.error("Error fetching resolver stats:", resolversError);
      return [];
    }
    
    return resolvers || [];
  } catch (error) {
    console.error("Error getting resolver leaderboard:", error);
    return [];
  }
};
