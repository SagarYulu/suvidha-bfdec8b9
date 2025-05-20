
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

// Check if feedback exists for a ticket
export const checkFeedbackExists = async (ticketId: string): Promise<boolean> => {
  try {
    console.log("Checking if feedback exists for ticket:", ticketId);
    
    const { data, error, count } = await supabase
      .from('resolution_feedback')
      .select('id', { count: 'exact' })
      .eq('ticket_id', ticketId);
    
    if (error) {
      console.error("Error checking feedback:", error);
      return false;
    }
    
    const exists = !!count && count > 0;
    console.log(`Feedback ${exists ? 'exists' : 'does not exist'} for ticket ${ticketId}`);
    return exists;
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
    // Since we don't have the stored procedure available, let's implement a direct query approach
    // First, get closed tickets that match the filters
    let query = supabase
      .from('issues')
      .select(`
        id, 
        assigned_to,
        closed_at
      `)
      .eq('status', 'closed');
    
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
    
    if (ticketsError || !tickets) {
      console.error("Error fetching tickets:", ticketsError);
      return [];
    }
    
    // Group tickets by resolver
    const resolverMap: Record<string, { tickets: string[], name: string }> = {};
    
    for (const ticket of tickets) {
      if (ticket.assigned_to) {
        if (!resolverMap[ticket.assigned_to]) {
          resolverMap[ticket.assigned_to] = {
            tickets: [],
            name: "Resolver " + ticket.assigned_to.substring(0, 5) // Placeholder name
          };
        }
        resolverMap[ticket.assigned_to].tickets.push(ticket.id);
      }
    }
    
    // Get feedback for these tickets
    const allTicketIds = tickets.map(ticket => ticket.id);
    
    if (allTicketIds.length === 0) {
      return [];
    }
    
    const { data: feedbacks, error: feedbackError } = await supabase
      .from('resolution_feedback')
      .select('ticket_id, rating')
      .in('ticket_id', allTicketIds);
    
    if (feedbackError) {
      console.error("Error fetching feedback:", feedbackError);
      return [];
    }
    
    // Calculate stats for each resolver
    const resolverStats: ResolverStats[] = [];
    
    for (const [resolverUuid, info] of Object.entries(resolverMap)) {
      const resolverTickets = info.tickets;
      const resolverFeedbacks = feedbacks?.filter(f => resolverTickets.includes(f.ticket_id)) || [];
      
      const totalTickets = resolverTickets.length;
      const feedbackReceived = resolverFeedbacks.length;
      
      // Calculate average rating
      const totalRating = resolverFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
      const averageRating = feedbackReceived > 0 ? totalRating / feedbackReceived : 0;
      
      resolverStats.push({
        resolverUuid,
        resolverName: info.name,
        averageRating,
        totalTickets,
        feedbackReceived
      });
    }
    
    // Sort by average rating (highest first)
    return resolverStats.sort((a, b) => b.averageRating - a.averageRating);
  } catch (error) {
    console.error("Error getting resolver leaderboard:", error);
    return [];
  }
};
