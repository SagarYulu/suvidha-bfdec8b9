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
    
    // Apply date filters if provided - using strict date range filtering
    if (filters.startDate) {
      // Start date is inclusive (>=)
      query = query.gte('created_at', `${filters.startDate}T00:00:00`);
    }
    
    if (filters.endDate) {
      // End date is inclusive but we add 1 day to make it exclusive of the next day
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
    
    console.log("Executing query with date range filters:", filters.startDate, "to", filters.endDate);
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching sentiment data:", error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} sentiment records`);
    
    // Generate more comprehensive sample data for testing comparisons
    const useMoreSampleData = false; // Set to false to use real data only
    
    if (data && data.length > 0 && !useMoreSampleData) {
      // Apply additional client-side filtering to ensure exact date matching
      const filteredData = data.filter(item => {
        if (!item.created_at) return false;
        
        const itemDate = new Date(item.created_at);
        const itemDateStr = itemDate.toISOString().split('T')[0];
        
        let includeItem = true;
        
        if (filters.startDate) {
          includeItem = includeItem && itemDateStr >= filters.startDate;
        }
        
        if (filters.endDate) {
          includeItem = includeItem && itemDateStr <= filters.endDate;
        }
        
        return includeItem;
      });
      
      console.log(`Returning ${filteredData.length} filtered sentiment records within date range`);
      return filteredData;
    }
    
    // Rest of the mock data generation code (only used if useMoreSampleData is true)
    // ... keep existing code (mock data generation)
    
    return data || [];
  } catch (error) {
    console.error("Error in fetchAllSentiment:", error);
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

// Function to generate test sentiment data
export const generateTestSentimentData = async (): Promise<{
  employeesSelected: number;
  entriesCreated: number;
  periodsGenerated: string[];
}> => {
  try {
    console.log("Starting test data generation...");
    
    // Time periods to generate data for
    const periods = [
      { name: "Current Week", days: 7 },
      { name: "Last Week", days: 14 },
      { name: "Last Month", days: 30 },
      { name: "Last Quarter", days: 90 },
      { name: "Last Year", days: 365 }
    ];
    
    // Get all available sentiment tags
    const { data: tags, error: tagsError } = await supabase
      .from('sentiment_tags')
      .select('id, name')
      .order('name');
    
    if (tagsError) {
      console.error("Error fetching tags:", tagsError);
      throw new Error("Failed to fetch sentiment tags");
    }
    
    if (!tags || tags.length === 0) {
      throw new Error("No sentiment tags found in the database");
    }
    
    console.log(`Found ${tags.length} sentiment tags`);
    
    // Get random set of employees (limit to 15 for reasonable test data volume)
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, city, cluster, role')
      .limit(15);
    
    if (employeesError) {
      console.error("Error fetching employees:", employeesError);
      throw new Error("Failed to fetch employees");
    }
    
    if (!employees || employees.length === 0) {
      throw new Error("No employees found in the database");
    }
    
    console.log(`Selected ${employees.length} employees for test data`);
    
    // Generate data for each employee across time periods
    let entriesCreated = 0;
    const now = new Date();
    const batch = [];
    
    // For each employee
    for (const employee of employees) {
      // For each time period
      for (const period of periods) {
        // Generate 2-3 entries per period
        const entriesCount = Math.floor(Math.random() * 2) + 2; // 2-3 entries
        
        for (let i = 0; i < entriesCount; i++) {
          // Calculate a random date within this period
          const randomDay = Math.floor(Math.random() * period.days);
          const entryDate = new Date(now);
          entryDate.setDate(entryDate.getDate() - randomDay);
          
          // Random rating between 1-5
          const rating = Math.floor(Math.random() * 5) + 1;
          
          // Calculate sentiment score (0.0-1.0) based on rating
          const sentimentScore = (rating / 5.0).toFixed(2);
          
          // Determine sentiment label based on rating
          let sentimentLabel;
          if (rating >= 4) {
            sentimentLabel = "positive";
          } else if (rating === 3) {
            sentimentLabel = "neutral";
          } else {
            sentimentLabel = "negative";
          }
          
          // Select 1-2 random tags
          const tagCount = Math.floor(Math.random() * 2) + 1; // 1-2 tags
          const selectedTags = [];
          
          for (let t = 0; t < tagCount; t++) {
            const randomTagIndex = Math.floor(Math.random() * tags.length);
            selectedTags.push(tags[randomTagIndex].name);
          }
          
          // Create sentiment entry
          const sentimentEntry = {
            employee_id: employee.id,
            rating: rating,
            sentiment_score: parseFloat(sentimentScore),
            sentiment_label: sentimentLabel,
            tags: selectedTags,
            city: employee.city,
            cluster: employee.cluster,
            role: employee.role,
            created_at: entryDate.toISOString()
          };
          
          batch.push(sentimentEntry);
          entriesCreated++;
        }
      }
    }
    
    // Insert all entries in one batch
    console.log(`Inserting ${batch.length} sentiment entries...`);
    const { error: insertError } = await supabase
      .from('employee_sentiment')
      .insert(batch);
      
    if (insertError) {
      console.error("Error inserting sentiment data:", insertError);
      throw new Error("Failed to insert sentiment test data");
    }
    
    console.log(`Successfully created ${entriesCreated} sentiment entries for ${employees.length} employees`);
    
    // Return the results
    return {
      employeesSelected: employees.length,
      entriesCreated: entriesCreated,
      periodsGenerated: periods.map(p => p.name)
    };
    
  } catch (error) {
    console.error("Error generating test data:", error);
    throw error;
  }
};
