
import { mockSupabase as supabase } from '@/lib/mockSupabase';

export const sentimentService = {
  async getSentimentData() {
    try {
      // Mock implementation using our mock supabase client
      const { data, error } = await supabase.from('ticket_feedback').select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
      return [];
    }
  },

  async submitSentiment(sentimentData: any) {
    try {
      const { data, error } = await supabase.from('ticket_feedback').insert(sentimentData);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting sentiment:', error);
      throw error;
    }
  }
};
