
import { supabase } from "@/integrations/supabase/client";

export type SentimentRating = {
  id?: string;
  employee_id: string;
  rating: number;
  feedback?: string;
  city?: string;
  cluster?: string;
  role?: string;
  tags?: string[];
  sentiment_score?: number;
  sentiment_label?: string;
  created_at?: string;
};

export type SentimentTag = {
  id: string;
  name: string;
  category?: string;
};

export type SentimentAlert = {
  id: string;
  city?: string;
  cluster?: string;
  role?: string;
  average_score: number;
  previous_average_score?: number;
  change_percentage?: number;
  trigger_reason: string;
  is_resolved: boolean;
  created_at: string;
};

export type SentimentAnalysisResult = {
  sentiment_score: number | null;
  sentiment_label: string | null;
  rating?: number;
  suggested_tags: string[];
  flag_urgent?: boolean;
  flag_abusive?: boolean;
};

// Function to analyze sentiment using Supabase Edge Function
export const analyzeSentiment = async (feedback: string): Promise<SentimentAnalysisResult> => {
  try {
    console.log("Analyzing sentiment for feedback:", feedback);
    const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
      body: { feedback }
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(error.message);
    }
    
    console.log("Sentiment analysis result:", data);
    return data;
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    // Return sensible defaults instead of failing completely
    return {
      sentiment_score: null,
      sentiment_label: null,
      rating: undefined,
      suggested_tags: []
    };
  }
};

// Function to submit sentiment with better error handling
export const submitSentiment = async (sentimentData: SentimentRating): Promise<{ success: boolean, error?: string }> => {
  try {
    console.log("Submitting sentiment data:", sentimentData);
    
    // Make sure we have the required fields
    if (!sentimentData.employee_id) {
      return { success: false, error: "Missing employee ID" };
    }
    
    // Convert tags array to string array if it's not already
    let formattedData: any = { ...sentimentData };
    
    // Ensure tags is sent as an array
    if (formattedData.tags && !Array.isArray(formattedData.tags)) {
      try {
        formattedData.tags = JSON.parse(formattedData.tags);
      } catch (e) {
        formattedData.tags = formattedData.tags.split(',').map((tag: string) => tag.trim());
      }
    }
    
    console.log("Formatted data for submission:", formattedData);
    
    const { error, data } = await supabase
      .from('employee_sentiment')
      .insert(formattedData)
      .select();
    
    if (error) {
      console.error("Supabase error:", error);
      return { success: false, error: error.message };
    }
    
    console.log("Sentiment submission successful:", data);
    return { success: true };
  } catch (error: any) {
    console.error("Error submitting sentiment:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
};

// Function to fetch sentiment tags
export const fetchSentimentTags = async (): Promise<SentimentTag[]> => {
  try {
    const { data, error } = await supabase
      .from('sentiment_tags')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching sentiment tags:", error);
    return [];
  }
};

// Function to fetch user sentiment history
export const fetchUserSentimentHistory = async (employeeId: string): Promise<SentimentRating[]> => {
  try {
    const { data, error } = await supabase
      .from('employee_sentiment')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user sentiment history:", error);
    return [];
  }
};

// Admin functions for dashboard
export const fetchAllSentiment = async (filters: {
  startDate?: string;
  endDate?: string;
  city?: string;
  cluster?: string;
  role?: string;
}): Promise<SentimentRating[]> => {
  try {
    console.log("Fetching sentiment with filters:", filters);
    
    let query = supabase
      .from('employee_sentiment')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply date filters if provided
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      // Add one day to include the end date fully
      const endDate = new Date(filters.endDate);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }
    
    // Apply city filter - this is the key fix to ensure we're using the proper column
    if (filters.city) {
      console.log("Filtering by city name:", filters.city);
      // Use ilike for case-insensitive text search rather than direct UUID comparison
      query = query.ilike('city', `%${filters.city}%`);
    }
    
    // Apply cluster filter
    if (filters.cluster) {
      console.log("Filtering by cluster:", filters.cluster);
      query = query.eq('cluster', filters.cluster);
    }
    
    // Apply role filter
    if (filters.role) {
      console.log("Filtering by role:", filters.role);
      query = query.eq('role', filters.role);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching sentiment data:", error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} sentiment records`);
    return data || [];
  } catch (error) {
    console.error("Error fetching all sentiment:", error);
    return [];
  }
};

// Function to fetch sentiment alerts
export const fetchSentimentAlerts = async (resolved: boolean = false): Promise<SentimentAlert[]> => {
  try {
    const { data, error } = await supabase
      .from('sentiment_alerts')
      .select('*')
      .eq('is_resolved', resolved)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching sentiment alerts:", error);
    return [];
  }
};

// Function to resolve an alert
export const resolveSentimentAlert = async (alertId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('sentiment_alerts')
      .update({ is_resolved: true })
      .eq('id', alertId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error resolving sentiment alert:", error);
    return false;
  }
};
