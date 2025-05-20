
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

// Create a mocked version of the sentiment service functions
// In a real implementation, these would connect to actual database tables

// Function to analyze sentiment using Supabase Edge Function
export const analyzeSentiment = async (feedback: string): Promise<SentimentAnalysisResult> => {
  try {
    console.log("Analyzing sentiment for feedback:", feedback);
    // This would call a real edge function in production
    // For now, return a mock result based on simple word analysis
    
    const lowerFeedback = feedback.toLowerCase();
    let score = 0;
    let label = "neutral";
    let suggested_tags: string[] = [];
    
    // Simple sentiment analysis mock
    if (lowerFeedback.includes("great") || lowerFeedback.includes("love") || lowerFeedback.includes("excellent")) {
      score = 0.8;
      label = "positive";
      suggested_tags = ["Career Growth", "Team"];
    } else if (lowerFeedback.includes("good") || lowerFeedback.includes("nice") || lowerFeedback.includes("happy")) {
      score = 0.6;
      label = "positive";
      suggested_tags = ["Work-Life Balance"];
    } else if (lowerFeedback.includes("bad") || lowerFeedback.includes("issue") || lowerFeedback.includes("problem")) {
      score = -0.6;
      label = "negative";
      suggested_tags = ["Workload", "Communication"];
    } else if (lowerFeedback.includes("terrible") || lowerFeedback.includes("awful") || lowerFeedback.includes("hate")) {
      score = -0.8;
      label = "negative";
      suggested_tags = ["Manager"];
    }
    
    // Check for urgent or abusive content
    const isUrgent = lowerFeedback.includes("urgent") || lowerFeedback.includes("immediately") || 
                     lowerFeedback.includes("emergency");
    const isAbusive = lowerFeedback.includes("idiot") || lowerFeedback.includes("stupid") || 
                      lowerFeedback.includes("hate");
    
    return {
      sentiment_score: score,
      sentiment_label: label,
      suggested_tags,
      flag_urgent: isUrgent,
      flag_abusive: isAbusive
    };
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    // Return sensible defaults instead of failing completely
    return {
      sentiment_score: null,
      sentiment_label: null,
      suggested_tags: []
    };
  }
};

// Function to submit sentiment with better error handling and metadata processing
export const submitSentiment = async (sentimentData: SentimentRating): Promise<{ success: boolean, error?: string }> => {
  try {
    console.log("Mock submitting sentiment data:", sentimentData);
    
    // Make sure we have the required fields
    if (!sentimentData.employee_id) {
      return { success: false, error: "Missing employee ID" };
    }
    
    // In a real implementation, this would insert the data into a database
    // For now, we'll just mock a successful submission
    
    return { success: true };
  } catch (error: any) {
    console.error("Error submitting sentiment:", error);
    return { success: false, error: error.message || "Unknown error occurred" };
  }
};

// Mock check and create alert function - would be internal in the real implementation
async function checkAndCreateAlert(newSentiment: SentimentRating) {
  console.log("Mock checking for alerts based on sentiment:", newSentiment);
  // In a real implementation, this would analyze sentiment trends and create alerts
}

// Function to fetch sentiment tags with improved logging and error handling
export const fetchSentimentTags = async (): Promise<SentimentTag[]> => {
  try {
    console.log("Mock fetching sentiment tags...");
    
    // Return mock data instead of querying a non-existent table
    return [
      { id: 'tag-1', name: 'Work-Life Balance', category: 'Wellness' },
      { id: 'tag-2', name: 'Career Growth', category: 'Development' },
      { id: 'tag-3', name: 'Salary', category: 'Benefits' },
      { id: 'tag-4', name: 'Manager', category: 'Leadership' },
      { id: 'tag-5', name: 'Team', category: 'Work Environment' },
      { id: 'tag-6', name: 'Workload', category: 'Wellness' },
      { id: 'tag-7', name: 'Communication', category: 'Leadership' },
      { id: 'tag-8', name: 'Work Place', category: 'Infrastructure' },
      { id: 'tag-9', name: 'Training', category: 'Guiding' }
    ];
  } catch (error) {
    console.error("Exception in fetchSentimentTags:", error);
    return [];
  }
};

// Function to fetch user sentiment history
export const fetchUserSentimentHistory = async (employeeId: string): Promise<SentimentRating[]> => {
  try {
    console.log("Mock fetching user sentiment history for employee:", employeeId);
    // In a real implementation, this would query the database
    // For now, return mock data
    return [
      {
        id: "mock-1",
        employee_id: employeeId,
        rating: 4,
        feedback: "Great work environment this month",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        sentiment_score: 0.8,
        sentiment_label: "positive"
      },
      {
        id: "mock-2",
        employee_id: employeeId,
        rating: 3,
        feedback: "Average experience this week",
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        sentiment_score: 0,
        sentiment_label: "neutral"
      }
    ];
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
    console.log("Mock fetching sentiment with filters:", JSON.stringify(filters, null, 2));
    
    // Generate mock data based on filters
    const mockData: SentimentRating[] = [];
    const startDate = filters.startDate ? new Date(filters.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
    
    // Generate 20 random entries within the date range
    for (let i = 0; i < 20; i++) {
      const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
      const rating = Math.floor(Math.random() * 5) + 1;
      
      mockData.push({
        id: `mock-${i}`,
        employee_id: `emp-${Math.floor(Math.random() * 100)}`,
        rating: rating,
        feedback: rating > 3 ? "Positive feedback" : (rating === 3 ? "Neutral feedback" : "Negative feedback"),
        created_at: randomDate.toISOString(),
        city: filters.city || ['Mumbai', 'Delhi', 'Bangalore'][Math.floor(Math.random() * 3)],
        cluster: filters.cluster || ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)],
        role: filters.role || ['Manager', 'Developer', 'HR', 'Support'][Math.floor(Math.random() * 4)],
        sentiment_score: (rating - 3) / 2, // Convert 1-5 to -1 to 1 scale
        sentiment_label: rating > 3 ? "positive" : (rating === 3 ? "neutral" : "negative")
      });
    }
    
    return mockData;
  } catch (error) {
    console.error("Error in fetchAllSentiment:", error);
    return [];
  }
};

// Function to fetch sentiment alerts
export const fetchSentimentAlerts = async (resolved: boolean = false): Promise<SentimentAlert[]> => {
  try {
    console.log("Mock fetching sentiment alerts, resolved:", resolved);
    
    // Return mock data
    if (resolved) {
      return [
        {
          id: "alert-1",
          city: "Mumbai",
          cluster: "North",
          average_score: 2.1,
          previous_average_score: 3.8,
          change_percentage: -45,
          trigger_reason: "Significant drop in employee sentiment",
          is_resolved: true,
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    } else {
      return [
        {
          id: "alert-2",
          city: "Bangalore",
          role: "Developer",
          average_score: 1.8,
          previous_average_score: 3.5,
          change_percentage: -48,
          trigger_reason: "Employee sentiment is notably low",
          is_resolved: false,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
    }
  } catch (error) {
    console.error("Error fetching sentiment alerts:", error);
    return [];
  }
};

// Function to resolve an alert
export const resolveSentimentAlert = async (alertId: string): Promise<boolean> => {
  try {
    console.log("Mock resolving sentiment alert:", alertId);
    // In a real implementation, this would update the database
    return true;
  } catch (error) {
    console.error("Error resolving sentiment alert:", error);
    return false;
  }
};

// Function to generate test sentiment data for demo purposes
export const generateTestSentimentData = async (): Promise<{
  employeesProcessed: number;
  totalEntriesCreated: number;
  success: boolean;
}> => {
  try {
    console.log("Mock generating test sentiment data");
    
    // In a real implementation, this would create records in the database
    // For now, just return mock results
    
    return {
      employeesProcessed: 25,
      totalEntriesCreated: 75,
      success: true
    };
  } catch (error) {
    console.error("Error in generateTestSentimentData:", error);
    return { employeesProcessed: 0, totalEntriesCreated: 0, success: false };
  }
};
