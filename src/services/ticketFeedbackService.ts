
import { mockSupabase as supabase } from '@/lib/mockSupabase';

export const getTicketFeedback = async (filters: any = {}) => {
  try {
    let query = supabase.from('ticket_feedback').select('*');
    
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    if (filters.city) {
      query = query.eq('city', filters.city);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching ticket feedback:', error);
    return [];
  }
};

export const submitTicketFeedback = async (feedbackData: any) => {
  try {
    const { data, error } = await supabase.from('ticket_feedback').insert(feedbackData);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};
