
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedback } = await req.json();
    
    if (!feedback || feedback.trim().length === 0) {
      return new Response(
        JSON.stringify({
          sentiment_score: 0,
          sentiment_label: "neutral",
          suggested_tags: []
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Analyzing feedback:", feedback);
    
    // Simple sentiment analysis based on keywords
    const lowerFeedback = feedback.toLowerCase();
    let score = 0;
    let suggestedTags = [];
    
    // Positive keywords
    const positiveWords = ["happy", "great", "good", "excellent", "love", "appreciate", "thank", "helpful", "support", "satisfied"];
    
    // Negative keywords
    const negativeWords = ["unhappy", "bad", "terrible", "poor", "hate", "frustrated", "angry", "disappointing", "issue", "problem"];
    
    // Tag mapping by keywords
    const tagMapping = {
      "manager": ["Manager", "Leadership"],
      "pay": ["Compensation", "Finance"],
      "salary": ["Compensation", "Finance"],
      "money": ["Compensation", "Finance"],
      "team": ["Team", "Collaboration"],
      "colleague": ["Team", "Collaboration"],
      "work": ["Workload", "Work-Life Balance"],
      "time": ["Work-Life Balance", "Scheduling"],
      "hour": ["Work-Life Balance", "Scheduling"],
      "schedule": ["Scheduling", "Work-Life Balance"],
      "train": ["Training", "Career Growth"],
      "learn": ["Training", "Career Growth"],
      "grow": ["Career Growth", "Development"],
      "career": ["Career Growth", "Development"],
      "office": ["Facilities", "Work Environment"],
      "facility": ["Facilities", "Work Environment"],
      "environment": ["Work Environment", "Culture"],
      "communication": ["Communication", "Feedback"],
      "feedback": ["Feedback", "Communication"],
      "benefit": ["Benefits", "Compensation"],
      "health": ["Benefits", "Well-being"],
      "software": ["Technology", "Tools"],
      "tool": ["Tools", "Technology"],
      "system": ["Technology", "Process"],
      "process": ["Process", "Efficiency"]
    };
    
    // Check for positive words
    positiveWords.forEach(word => {
      if (lowerFeedback.includes(word)) score += 0.2;
    });
    
    // Check for negative words
    negativeWords.forEach(word => {
      if (lowerFeedback.includes(word)) score -= 0.2;
    });
    
    // Collect suggested tags
    Object.keys(tagMapping).forEach(keyword => {
      if (lowerFeedback.includes(keyword)) {
        suggestedTags = [...suggestedTags, ...tagMapping[keyword]];
      }
    });
    
    // Remove duplicates from tags
    suggestedTags = [...new Set(suggestedTags)];
    
    // Limit to top 3 tags
    suggestedTags = suggestedTags.slice(0, 3);
    
    // Clamp score between -1 and 1
    score = Math.max(-1, Math.min(1, score));
    
    // Determine sentiment label
    let sentimentLabel = "neutral";
    if (score > 0.6) sentimentLabel = "very positive";
    else if (score > 0.2) sentimentLabel = "positive";
    else if (score < -0.6) sentimentLabel = "very negative";
    else if (score < -0.2) sentimentLabel = "negative";
    
    // Map sentiment label to suggested rating (1-5)
    let suggestedRating;
    if (sentimentLabel === "very positive") suggestedRating = 5;
    else if (sentimentLabel === "positive") suggestedRating = 4;
    else if (sentimentLabel === "neutral") suggestedRating = 3;
    else if (sentimentLabel === "negative") suggestedRating = 2;
    else if (sentimentLabel === "very negative") suggestedRating = 1;
    
    const result = {
      sentiment_score: score,
      sentiment_label: sentimentLabel,
      suggested_tags: suggestedTags,
      rating: suggestedRating
    };
    
    console.log("Analysis result:", result);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in sentiment analysis:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to analyze sentiment",
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
