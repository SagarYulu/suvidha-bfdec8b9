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

// Function to submit sentiment with better error handling and metadata processing
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
    
    // Add timestamp for better tracking
    formattedData.created_at = new Date().toISOString();
    
    // Make sure city, cluster, and role are properly set
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
    
    // After successful submission, check if we need to create alert
    await checkAndCreateAlert(formattedData);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error submitting sentiment:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
};

// Check and create alert if sentiment trends warrant it
async function checkAndCreateAlert(newSentiment: SentimentRating) {
  try {
    // Only create alerts if we have city or cluster info
    if (!newSentiment.city && !newSentiment.cluster && !newSentiment.role) {
      return;
    }
    
    // Get previous sentiment data for the same city, cluster, or role
    let query = supabase
      .from('employee_sentiment')
      .select('rating, sentiment_score, created_at')
      .order('created_at', { ascending: false })
      .limit(30); // Look at last 30 entries for trend
    
    if (newSentiment.city) {
      query = query.eq('city', newSentiment.city);
    }
    
    if (newSentiment.cluster) {
      query = query.eq('cluster', newSentiment.cluster);
    }
    
    if (newSentiment.role) {
      query = query.eq('role', newSentiment.role);
    }
    
    const { data: previousSentiment, error } = await query;
    
    if (error || !previousSentiment || previousSentiment.length < 5) {
      // Not enough data to create meaningful alert
      return;
    }
    
    // Calculate averages
    const recentSentiment = previousSentiment.slice(0, 10);
    const olderSentiment = previousSentiment.slice(10, 30);
    
    if (olderSentiment.length < 5) {
      return; // Not enough historical data
    }
    
    const recentAverage = recentSentiment.reduce((sum, item) => sum + (item.rating || 3), 0) / recentSentiment.length;
    const olderAverage = olderSentiment.reduce((sum, item) => sum + (item.rating || 3), 0) / olderSentiment.length;
    
    const percentChange = ((recentAverage - olderAverage) / olderAverage) * 100;
    
    // Create alert for significant negative changes
    if (percentChange < -15 || (recentAverage < 2.5 && olderAverage > 3.5)) {
      // Significant negative change or absolute low score
      const alert = {
        city: newSentiment.city,
        cluster: newSentiment.cluster, 
        role: newSentiment.role,
        average_score: recentAverage,
        previous_average_score: olderAverage,
        change_percentage: percentChange,
        trigger_reason: percentChange < -15 
          ? "Significant drop in employee sentiment"
          : "Employee sentiment is notably low",
        is_resolved: false
      };
      
      await supabase.from('sentiment_alerts').insert(alert);
      console.log("Created sentiment alert:", alert);
    }
  } catch (error) {
    console.error("Error checking for sentiment alerts:", error);
  }
}

// Function to fetch sentiment tags with improved logging and error handling
export const fetchSentimentTags = async (): Promise<SentimentTag[]> => {
  try {
    console.log("Fetching sentiment tags from database...");
    
    const { data, error } = await supabase
      .from('sentiment_tags')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Database error when fetching sentiment tags:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn("No sentiment tags found in the database");
      return [];
    }
    
    console.log(`Successfully fetched ${data.length} sentiment tags:`, data);
    return data;
  } catch (error) {
    console.error("Exception in fetchSentimentTags:", error);
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
    console.log("Fetching sentiment with filters:", JSON.stringify(filters, null, 2));
    
    let query = supabase
      .from('employee_sentiment')
      .select('*')
      .order('created_at', { ascending: true });
    
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
    
    // Apply city filter - using case-insensitive match and handling null values
    if (filters.city && filters.city !== 'all-cities') {
      console.log("Filtering by city name:", filters.city);
      query = query.ilike('city', `%${filters.city}%`);
    }
    
    // Apply cluster filter - using case-insensitive match and handling null values
    if (filters.cluster && filters.cluster !== 'all-clusters') {
      console.log("Filtering by cluster:", filters.cluster);
      query = query.ilike('cluster', `%${filters.cluster}%`);
    }
    
    // Apply role filter - using case-insensitive match and handling null values
    if (filters.role && filters.role !== 'all-roles') {
      console.log("Filtering by role:", filters.role);
      query = query.ilike('role', `%${filters.role}%`);
    }
    
    console.log("Executing query...");
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching sentiment data:", error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} sentiment records`);
    
    // Generate more comprehensive sample data for testing comparisons
    const useMoreSampleData = true; // Set to true to always generate sample data for testing comparison
    
    if (data && data.length > 0 && !useMoreSampleData) {
      return data;
    }
    
    // Create base data from any existing entries
    const baseData = data || [];
    
    // Generate more comprehensive mock data for testing comparison modes
    const today = new Date();
    const mockData = [];
    
    // Create data points for current period (last 30 days)
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create 2-4 entries per day with varying ratings
      const entriesForDay = Math.floor(Math.random() * 3) + 2;
      
      for (let j = 0; j < entriesForDay; j++) {
        // Generate data with realistic patterns
        // More positive on weekends, more neutral/negative midweek
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        let moodBias = 0;
        
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          moodBias = 1; // Weekend bias (more positive)
        } else if (dayOfWeek === 3) {
          moodBias = -0.5; // Wednesday bias (more negative)
        }
        
        // Base rating with some randomness and day-of-week bias
        let rating = Math.floor(Math.random() * 5) + 1;
        rating = Math.max(1, Math.min(5, rating + (moodBias > 0 ? 1 : moodBias < 0 ? -1 : 0)));
        
        // Sentiment label based on rating
        let sentimentLabel = '';
        let sentimentScore = 0;
        
        switch (rating) {
          case 1:
            sentimentLabel = 'very negative';
            sentimentScore = -0.8 - Math.random() * 0.2; // -0.8 to -1.0
            break;
          case 2:
            sentimentLabel = 'negative';
            sentimentScore = -0.4 - Math.random() * 0.4; // -0.4 to -0.8
            break;
          case 3:
            sentimentLabel = 'neutral';
            sentimentScore = -0.2 + Math.random() * 0.4; // -0.2 to 0.2
            break;
          case 4:
            sentimentLabel = 'positive';
            sentimentScore = 0.4 + Math.random() * 0.4; // 0.4 to 0.8
            break;
          case 5:
            sentimentLabel = 'very positive';
            sentimentScore = 0.8 + Math.random() * 0.2; // 0.8 to 1.0
            break;
        }
        
        // Create different topic distributions based on sentiment
        let tags = [];
        
        if (rating <= 2) {
          // Negative sentiment topics
          const negativeTags = [
            'Workload',
            'Communication',
            'Management',
            'Work-Life Balance',
            'Compensation',
            'Resources',
            'Team Dynamics',
            'Stress',
            'Recognition',
            'Process Issues'
          ];
          
          // Pick 1-3 random tags from the negative list
          const tagCount = Math.floor(Math.random() * 3) + 1;
          for (let t = 0; t < tagCount; t++) {
            const randomTag = negativeTags[Math.floor(Math.random() * negativeTags.length)];
            if (!tags.includes(randomTag)) tags.push(randomTag);
          }
        } else if (rating >= 4) {
          // Positive sentiment topics
          const positiveTags = [
            'Team',
            'Recognition',
            'Career Growth',
            'Leadership',
            'Work Environment',
            'Flexibility',
            'Benefits',
            'Culture',
            'Innovation',
            'Training'
          ];
          
          // Pick 1-3 random tags from the positive list
          const tagCount = Math.floor(Math.random() * 3) + 1;
          for (let t = 0; t < tagCount; t++) {
            const randomTag = positiveTags[Math.floor(Math.random() * positiveTags.length)];
            if (!tags.includes(randomTag)) tags.push(randomTag);
          }
        } else {
          // Neutral sentiment topics
          const neutralTags = [
            'Process',
            'Communication',
            'Workspace',
            'Equipment',
            'Training',
            'Policies',
            'Schedule',
            'Meetings',
            'Collaboration',
            'Onboarding'
          ];
          
          // Pick 1-2 random tags from the neutral list
          const tagCount = Math.floor(Math.random() * 2) + 1;
          for (let t = 0; t < tagCount; t++) {
            const randomTag = neutralTags[Math.floor(Math.random() * neutralTags.length)];
            if (!tags.includes(randomTag)) tags.push(randomTag);
          }
        }

        // Generic feedback templates based on sentiment
        let feedback = '';
        if (rating === 1) {
          const veryNegativeFeedback = [
            "Extremely frustrated with the current situation.",
            "Feeling completely overwhelmed and unsupported.",
            "Major issues with workload distribution that need immediate attention.",
            "Very disappointed with recent management decisions.",
            "Serious concerns about team direction and lack of clear objectives."
          ];
          feedback = veryNegativeFeedback[Math.floor(Math.random() * veryNegativeFeedback.length)];
        } else if (rating === 2) {
          const negativeFeedback = [
            "Struggling with current workload and expectations.",
            "Communication issues are causing problems in our team.",
            "Not feeling valued or recognized for my contributions.",
            "Concerned about the work-life balance in our department.",
            "The processes need improvement as they're inefficient."
          ];
          feedback = negativeFeedback[Math.floor(Math.random() * negativeFeedback.length)];
        } else if (rating === 3) {
          const neutralFeedback = [
            "Things are going okay, no major issues to report.",
            "Some processes work well, others could be improved.",
            "The workload is manageable most of the time.",
            "Communication is adequate but could be better.",
            "The team environment is generally satisfactory."
          ];
          feedback = neutralFeedback[Math.floor(Math.random() * neutralFeedback.length)];
        } else if (rating === 4) {
          const positiveFeedback = [
            "Enjoying my role and the team environment.",
            "Communication has improved significantly recently.",
            "Feeling supported by management in my career goals.",
            "Good work-life balance and flexible arrangements.",
            "Appreciate the recognition for recent accomplishments."
          ];
          feedback = positiveFeedback[Math.floor(Math.random() * positiveFeedback.length)];
        } else {
          const veryPositiveFeedback = [
            "Extremely satisfied with the team and leadership.",
            "The work environment is excellent and supportive.",
            "Very happy with recent improvements and changes.",
            "Great opportunities for growth and development.",
            "Exceptional support from management and colleagues."
          ];
          feedback = veryPositiveFeedback[Math.floor(Math.random() * veryPositiveFeedback.length)];
        }
        
        // Rotate through cities, clusters, and roles for variety
        const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai'];
        const clusters = ['Central', 'Eastern', 'Western', 'Northern', 'Southern'];
        const roles = ['Engineer', 'Mechanic', 'Manager', 'Supervisor', 'Driver'];
        
        const city = cities[Math.floor(Math.random() * cities.length)];
        const cluster = clusters[Math.floor(Math.random() * clusters.length)];
        const role = roles[Math.floor(Math.random() * roles.length)];
        
        // Add entry to mock data
        mockData.push({
          id: `mock-${date.toISOString()}-${j}`,
          employee_id: `employee-${Math.floor(Math.random() * 1000)}`,
          rating,
          feedback,
          city: filters.city || city,
          cluster: filters.cluster || cluster,
          role: filters.role || role,
          tags,
          sentiment_score: sentimentScore,
          sentiment_label: sentimentLabel,
          created_at: date.toISOString(),
        });
      }
    }
    
    // Create previous periods data (older than 30 days) for comparison
    // This allows testing week-over-week, month-over-month, etc.
    
    // Previous week/month with slight overall mood difference
    for (let i = 30; i < 60; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Fewer entries per day in previous periods (1-3)
      const entriesForDay = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < entriesForDay; j++) {
        // Previous period has slightly different mood pattern
        // Make previous period slightly worse for testing improvement scenarios
        const dayOfWeek = date.getDay();
        let moodBias = -0.5; // Previous period bias (slightly more negative)
        
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          moodBias = 0.5; // Weekend still positive but less so
        }
        
        // Base rating with more negative bias for previous period
        let rating = Math.floor(Math.random() * 5) + 1;
        rating = Math.max(1, Math.min(5, rating + (moodBias > 0 ? 0 : -1)));
        
        // Sentiment label based on rating (same logic as current period)
        let sentimentLabel = '';
        let sentimentScore = 0;
        
        switch (rating) {
          case 1:
            sentimentLabel = 'very negative';
            sentimentScore = -0.8 - Math.random() * 0.2;
            break;
          case 2:
            sentimentLabel = 'negative';
            sentimentScore = -0.4 - Math.random() * 0.4;
            break;
          case 3:
            sentimentLabel = 'neutral';
            sentimentScore = -0.2 + Math.random() * 0.4;
            break;
          case 4:
            sentimentLabel = 'positive';
            sentimentScore = 0.4 + Math.random() * 0.4;
            break;
          case 5:
            sentimentLabel = 'very positive';
            sentimentScore = 0.8 + Math.random() * 0.2;
            break;
        }
        
        // Previous period had different topic distribution
        // More workload and communication issues in previous period
        let tags = [];
        
        if (rating <= 2) {
          // Previous period negative tags - more focus on specific issues
          const negativeTags = [
            'Workload',
            'Communication',
            'Stress',
            'Process Issues',
            'Resources'
          ];
          
          const tagCount = Math.floor(Math.random() * 2) + 1;
          for (let t = 0; t < tagCount; t++) {
            const randomTag = negativeTags[Math.floor(Math.random() * negativeTags.length)];
            if (!tags.includes(randomTag)) tags.push(randomTag);
          }
        } else if (rating >= 4) {
          // Previous period positive tags
          const positiveTags = [
            'Team',
            'Work Environment',
            'Flexibility',
            'Culture'
          ];
          
          const tagCount = Math.floor(Math.random() * 2) + 1;
          for (let t = 0; t < tagCount; t++) {
            const randomTag = positiveTags[Math.floor(Math.random() * positiveTags.length)];
            if (!tags.includes(randomTag)) tags.push(randomTag);
          }
        } else {
          const neutralTags = [
            'Process',
            'Communication',
            'Equipment',
            'Schedule'
          ];
          
          if (Math.random() > 0.5) {
            tags.push(neutralTags[Math.floor(Math.random() * neutralTags.length)]);
          }
        }
        
        // Generic feedback templates for previous period
        // Less detailed feedback in previous period
        let feedback = '';
        if (rating <= 2) {
          const negativeFeedback = [
            "Having issues with the current workload.",
            "Communication problems in the team.",
            "Not feeling motivated lately.",
          ];
          feedback = negativeFeedback[Math.floor(Math.random() * negativeFeedback.length)];
        } else if (rating === 3) {
          const neutralFeedback = [
            "Things are average, nothing special to report.",
            "Neither good nor bad overall.",
          ];
          feedback = neutralFeedback[Math.floor(Math.random() * neutralFeedback.length)];
        } else {
          const positiveFeedback = [
            "Enjoying my work generally.",
            "Team atmosphere is good.",
          ];
          feedback = positiveFeedback[Math.floor(Math.random() * positiveFeedback.length)];
        }
        
        // Same location distribution as current period
        const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai'];
        const clusters = ['Central', 'Eastern', 'Western', 'Northern', 'Southern'];
        const roles = ['Engineer', 'Mechanic', 'Manager', 'Supervisor', 'Driver'];
        
        const city = cities[Math.floor(Math.random() * cities.length)];
        const cluster = clusters[Math.floor(Math.random() * clusters.length)];
        const role = roles[Math.floor(Math.random() * roles.length)];
        
        // Add entry to mock data
        mockData.push({
          id: `mock-prev-${date.toISOString()}-${j}`,
          employee_id: `employee-${Math.floor(Math.random() * 1000)}`,
          rating,
          feedback,
          city: filters.city || city,
          cluster: filters.cluster || cluster,
          role: filters.role || role,
          tags,
          sentiment_score: sentimentScore,
          sentiment_label: sentimentLabel,
          created_at: date.toISOString(),
        });
      }
    }
    
    // Additional data for quarter and year comparisons (60-90 days and 300-365 days ago)
    // For quarterly comparison
    for (let i = 90; i < 120; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      if (Math.random() > 0.7) { // Fewer entries for older periods
        const rating = Math.floor(Math.random() * 5) + 1;
        
        mockData.push({
          id: `mock-quarter-${date.toISOString()}`,
          employee_id: `employee-${Math.floor(Math.random() * 1000)}`,
          rating,
          feedback: "Quarterly comparison data point",
          city: filters.city || ['Bangalore', 'Mumbai', 'Delhi'][Math.floor(Math.random() * 3)],
          cluster: filters.cluster || ['Central', 'Eastern', 'Western'][Math.floor(Math.random() * 3)],
          role: filters.role || ['Engineer', 'Mechanic', 'Manager'][Math.floor(Math.random() * 3)],
          tags: rating > 3 ? ['Team', 'Culture'] : ['Workload', 'Process'],
          sentiment_score: rating > 3 ? 0.7 : (rating === 3 ? 0 : -0.7),
          sentiment_label: rating > 3 ? 'positive' : (rating === 3 ? 'neutral' : 'negative'),
          created_at: date.toISOString(),
        });
      }
    }
    
    // For yearly comparison
    for (let i = 350; i < 380; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      if (Math.random() > 0.8) { // Even fewer entries for yearly comparison
        const rating = Math.floor(Math.random() * 5) + 1;
        
        mockData.push({
          id: `mock-year-${date.toISOString()}`,
          employee_id: `employee-${Math.floor(Math.random() * 1000)}`,
          rating,
          feedback: "Yearly comparison data point",
          city: filters.city || ['Bangalore', 'Mumbai', 'Delhi'][Math.floor(Math.random() * 3)],
          cluster: filters.cluster || ['Central', 'Eastern', 'Western'][Math.floor(Math.random() * 3)],
          role: filters.role || ['Engineer', 'Mechanic', 'Manager'][Math.floor(Math.random() * 3)],
          tags: rating > 3 ? ['Recognition', 'Benefits'] : ['Management', 'Compensation'],
          sentiment_score: rating > 3 ? 0.6 : (rating === 3 ? 0 : -0.6),
          sentiment_label: rating > 3 ? 'positive' : (rating === 3 ? 'neutral' : 'negative'),
          created_at: date.toISOString(),
        });
      }
    }
    
    // Combine real data with mock data
    const combinedData = [...baseData, ...mockData];
    
    // Apply date filters to the combined data if needed
    let filteredData = combinedData;
    if (filters.startDate || filters.endDate) {
      filteredData = combinedData.filter(item => {
        const itemDate = new Date(item.created_at);
        
        if (filters.startDate && filters.endDate) {
          const start = new Date(filters.startDate);
          const end = new Date(filters.endDate);
          end.setDate(end.getDate() + 1); // Include end date fully
          return itemDate >= start && itemDate < end;
        } else if (filters.startDate) {
          const start = new Date(filters.startDate);
          return itemDate >= start;
        } else if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setDate(end.getDate() + 1); // Include end date fully
          return itemDate < end;
        }
        
        return true;
      });
    }
    
    return filteredData;
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
