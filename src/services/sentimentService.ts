
import { supabase } from "@/integrations/supabase/client";

// Define types for sentiment-related data
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
  sentiment_score: number;
  sentiment_label: string;
  rating?: number;
  suggested_tags: string[];
  flag_urgent?: boolean;
  flag_abusive?: boolean;
};

/**
 * Submit sentiment feedback
 * @param data Sentiment rating data
 * @returns Success status and error if any
 */
export const submitSentiment = async (data: SentimentRating): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log("Submitting sentiment (mock):", data);
    // Since we don't have an actual table, we'll just return success
    return { success: true };
  } catch (error: any) {
    console.error("Error submitting sentiment:", error);
    return { success: false, error: error.message || "Failed to submit feedback" };
  }
};

/**
 * Fetch all sentiment data with optional filters
 * @param filters Optional filters for city, cluster, role, date range
 * @returns Array of sentiment data
 */
export const fetchAllSentiment = async (filters?: {
  startDate?: string;
  endDate?: string;
  city?: string;
  cluster?: string;
  role?: string;
}): Promise<SentimentRating[]> => {
  try {
    console.log("Fetching sentiment data with filters (mock):", filters);
    // Return mock data
    const mockData: SentimentRating[] = [
      {
        id: "1",
        employee_id: "emp-001",
        rating: 4,
        feedback: "Great work environment",
        city: "Delhi",
        cluster: "North Delhi",
        role: "Driver",
        sentiment_score: 0.8,
        sentiment_label: "positive",
        created_at: new Date().toISOString(),
        tags: ["Work Environment", "Team"]
      },
      {
        id: "2",
        employee_id: "emp-002",
        rating: 2,
        feedback: "Need better facilities",
        city: "Mumbai",
        cluster: "South Mumbai",
        role: "Mechanic",
        sentiment_score: -0.3,
        sentiment_label: "negative",
        created_at: new Date().toISOString(),
        tags: ["Facilities", "Workload"]
      },
      // Add more mock data if needed
    ];
    
    return mockData;
  } catch (error) {
    console.error("Error fetching sentiment data:", error);
    return [];
  }
};

/**
 * Resolve a sentiment alert
 * @param alertId ID of the alert to resolve
 * @returns Success status
 */
export const resolveSentimentAlert = async (alertId: string): Promise<boolean> => {
  try {
    console.log("Resolving sentiment alert (mock):", alertId);
    // Since we don't have an actual table, we'll just return success
    return true;
  } catch (error) {
    console.error("Error resolving sentiment alert:", error);
    return false;
  }
};

/**
 * Fetch sentiment alerts
 * @param showResolved Whether to include resolved alerts
 * @returns Array of sentiment alerts
 */
export const fetchSentimentAlerts = async (showResolved: boolean = false): Promise<SentimentAlert[]> => {
  try {
    console.log("Fetching sentiment alerts (mock):", { showResolved });
    // Return mock data
    const mockAlerts: SentimentAlert[] = [
      {
        id: "alert-1",
        city: "Delhi",
        cluster: "North Delhi",
        role: "Driver",
        average_score: 1.8,
        previous_average_score: 3.2,
        change_percentage: -43.75,
        trigger_reason: "Significant drop in sentiment",
        is_resolved: false,
        created_at: new Date().toISOString()
      },
      {
        id: "alert-2",
        city: "Mumbai",
        cluster: "South Mumbai",
        role: "Mechanic",
        average_score: 2.1,
        previous_average_score: 2.0,
        change_percentage: 5.0,
        trigger_reason: "Negative sentiment trending",
        is_resolved: true,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
      // Add more mock data if needed
    ];
    
    if (!showResolved) {
      return mockAlerts.filter(alert => !alert.is_resolved);
    }
    
    return mockAlerts;
  } catch (error) {
    console.error("Error fetching sentiment alerts:", error);
    return [];
  }
};

/**
 * Fetch sentiment tags
 * @returns Array of sentiment tags
 */
export const fetchSentimentTags = async (): Promise<SentimentTag[]> => {
  try {
    console.log("Fetching sentiment tags (mock)");
    // Return mock data
    const mockTags: SentimentTag[] = [
      { id: "tag-1", name: "Work Environment", category: "Workplace" },
      { id: "tag-2", name: "Team", category: "People" },
      { id: "tag-3", name: "Management", category: "Leadership" },
      { id: "tag-4", name: "Salary", category: "Benefits" },
      { id: "tag-5", name: "Workload", category: "Job" },
      { id: "tag-6", name: "Career Growth", category: "Development" },
      { id: "tag-7", name: "Communication", category: "Leadership" },
      { id: "tag-8", name: "Work-Life Balance", category: "Wellness" },
      { id: "tag-9", name: "Facilities", category: "Infrastructure" }
    ];
    
    return mockTags;
  } catch (error) {
    console.error("Error fetching sentiment tags:", error);
    return [];
  }
};

/**
 * Analyze sentiment from feedback text
 * @param feedback Feedback text to analyze
 * @returns Analysis result
 */
export const analyzeSentiment = async (feedback: string): Promise<SentimentAnalysisResult> => {
  try {
    console.log("Analyzing sentiment (mock):", feedback);
    
    // Simple mock sentiment analysis based on keywords
    const lowerFeedback = feedback.toLowerCase();
    const positiveWords = ["good", "great", "excellent", "happy", "satisfied", "like", "enjoy"];
    const negativeWords = ["bad", "poor", "terrible", "unhappy", "dissatisfied", "dislike", "hate"];
    const urgentWords = ["urgent", "immediately", "emergency", "critical", "serious", "dangerous"];
    
    let positiveCount = positiveWords.filter(word => lowerFeedback.includes(word)).length;
    let negativeCount = negativeWords.filter(word => lowerFeedback.includes(word)).length;
    
    let sentimentScore = 0;
    let sentimentLabel = "neutral";
    let rating = 3;
    
    if (positiveCount > negativeCount) {
      sentimentScore = 0.5 + (positiveCount * 0.1);
      sentimentLabel = sentimentScore > 0.7 ? "very positive" : "positive";
      rating = sentimentScore > 0.7 ? 5 : 4;
    } else if (negativeCount > positiveCount) {
      sentimentScore = -0.5 - (negativeCount * 0.1);
      sentimentLabel = sentimentScore < -0.7 ? "very negative" : "negative";
      rating = sentimentScore < -0.7 ? 1 : 2;
    }
    
    // Cap the score within -1 to 1 range
    sentimentScore = Math.max(-1, Math.min(1, sentimentScore));
    
    // Determine suggested tags based on feedback content
    const suggestedTags: string[] = [];
    
    if (lowerFeedback.includes("salary") || lowerFeedback.includes("pay") || lowerFeedback.includes("money")) {
      suggestedTags.push("Salary");
    }
    
    if (lowerFeedback.includes("manager") || lowerFeedback.includes("management") || lowerFeedback.includes("boss")) {
      suggestedTags.push("Management");
    }
    
    if (lowerFeedback.includes("team") || lowerFeedback.includes("colleague") || lowerFeedback.includes("coworker")) {
      suggestedTags.push("Team");
    }
    
    if (lowerFeedback.includes("work") && (lowerFeedback.includes("life") || lowerFeedback.includes("balance"))) {
      suggestedTags.push("Work-Life Balance");
    }
    
    if (lowerFeedback.includes("facility") || lowerFeedback.includes("office") || lowerFeedback.includes("building")) {
      suggestedTags.push("Facilities");
    }
    
    // Check for potential urgent issues
    const flagUrgent = urgentWords.some(word => lowerFeedback.includes(word));
    
    // Check for potential abusive language (simple implementation)
    const abusiveWords = ["abuse", "harass", "bully", "threaten"];
    const flagAbusive = abusiveWords.some(word => lowerFeedback.includes(word));
    
    return {
      sentiment_score: sentimentScore,
      sentiment_label: sentimentLabel,
      rating,
      suggested_tags: suggestedTags,
      flag_urgent: flagUrgent,
      flag_abusive: flagAbusive
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      sentiment_score: 0,
      sentiment_label: "neutral",
      rating: 3,
      suggested_tags: []
    };
  }
};
