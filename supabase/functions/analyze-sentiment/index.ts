
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Simple function to analyze sentiment from text with improved tagging
const analyzeSentiment = (text: string) => {
  // Create a scoring system based on positive and negative words
  const positiveWords = [
    "good", "great", "excellent", "amazing", "awesome", "fantastic", "wonderful", 
    "happy", "satisfied", "convenient", "helpful", "easy", "comfortable", "enjoy",
    "like", "love", "appreciate", "best", "better", "improved", "thank", "thanks"
  ];

  const negativeWords = [
    "bad", "poor", "terrible", "awful", "horrible", "disappointing", "frustrated",
    "difficult", "hard", "unhappy", "unsatisfied", "inconvenient", "unhelpful", 
    "uncomfortable", "dislike", "hate", "worst", "worse", "not good", "problem",
    "issue", "complaint", "broken", "useless", "waste", "annoying", "annoyed"
  ];

  // Normalize text for comparison
  const normalized = text.toLowerCase();
  
  // Count word occurrences
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of positiveWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = normalized.match(regex);
    if (matches) {
      positiveCount += matches.length;
    }
  }
  
  for (const word of negativeWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = normalized.match(regex);
    if (matches) {
      negativeCount += matches.length;
    }
  }
  
  // Calculate sentiment score between -1 and 1
  let score = 0;
  if (positiveCount > 0 || negativeCount > 0) {
    score = (positiveCount - negativeCount) / (positiveCount + negativeCount);
  }
  
  // Determine label based on score - simplified labels
  let label;
  if (score >= 0.3) {
    label = "positive";
  } else if (score > -0.3 && score < 0.3) {
    label = "neutral";
  } else {
    label = "negative";
  }
  
  // Calculate suggested tags based on content - enhanced version with simplified categories
  const tagPatterns = [
    { pattern: /\b(pay|salary|wage|money|compensation|bonus|incentive|payment)\b/i, tag: "Compensation" },
    { pattern: /\b(team|colleague|coworker|co-worker|people|staff|teammates)\b/i, tag: "Team" },
    { pattern: /\b(manager|management|supervisor|leader|boss|superior|lead)\b/i, tag: "Manager" },
    { pattern: /\b(work|shift|hour|timing|schedule|time|workload|deadline|pressure)\b/i, tag: "Workload" },
    { pattern: /\b(train|learning|skill|education|development|grow|career|progress)\b/i, tag: "Career Growth" },
    { pattern: /\b(communicate|communication|information|update|informed|clarity)\b/i, tag: "Communication" },
    { pattern: /\b(balance|life|family|personal|stress|pressure|health|mental)\b/i, tag: "Work-Life Balance" },
    { pattern: /\b(equipment|tool|bike|resource|facility|office|infrastructure)\b/i, tag: "Equipment" },
    { pattern: /\b(appreciate|recognition|acknowledge|feedback|praise|reward|valued)\b/i, tag: "Recognition" },
    { pattern: /\b(policy|process|procedure|system|bureaucracy|rule|guideline)\b/i, tag: "Policies" }
  ];
  
  const suggestedTags: string[] = [];
  
  for (const { pattern, tag } of tagPatterns) {
    if (pattern.test(normalized)) {
      suggestedTags.push(tag);
    }
  }
  
  // Flag for urgent issues
  const urgentPatterns = [
    /\b(urgent|immediately|emergency|danger|unsafe|critical|serious)\b/i,
    /\b(quit|resign|leaving|fire|fired|quitting)\b/i,
    /\b(harassment|bully|discrimination|abuse|threat)\b/i
  ];
  
  const flagUrgent = urgentPatterns.some(pattern => pattern.test(normalized));
  
  // Flag for abusive content
  const abusivePatterns = [
    /\b(damn|hell|idiot|stupid|useless|sucks|terrible|worst|hate)\b/i,
    /\b(curse|swear|offensive|inappropriate)\b/i
  ];
  
  const flagAbusive = abusivePatterns.some(pattern => pattern.test(normalized));
  
  // Suggest rating based on sentiment - simplified rating calculation
  let suggestedRating: number | undefined = undefined;
  if (score >= 0.5) {
    suggestedRating = 5; // Very positive
  } else if (score >= 0.1) {
    suggestedRating = 4; // Positive
  } else if (score >= -0.1) {
    suggestedRating = 3; // Neutral
  } else if (score >= -0.5) {
    suggestedRating = 2; // Negative
  } else {
    suggestedRating = 1; // Very negative
  }
  
  return {
    sentiment_score: score,
    sentiment_label: label,
    rating: suggestedRating,
    suggested_tags: suggestedTags,
    flag_urgent: flagUrgent,
    flag_abusive: flagAbusive
  };
};

// CORS headers for cross-domain requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    // Get the request body
    const body = await req.json();
    
    // Make sure we have feedback text
    if (!body || !body.feedback) {
      return new Response(
        JSON.stringify({ error: 'Missing feedback text in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Analyzing sentiment for:", body.feedback.substring(0, 50) + (body.feedback.length > 50 ? "..." : ""));
    
    // Analyze the sentiment
    const result = analyzeSentiment(body.feedback);
    
    console.log("Analysis result:", JSON.stringify(result));
    
    // Return the result
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sentiment analysis function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
