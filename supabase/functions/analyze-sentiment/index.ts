
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import OpenAI from "https://esm.sh/openai@4.20.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { feedback } = await req.json();
    
    if (!feedback || feedback.trim() === "") {
      return new Response(
        JSON.stringify({ 
          sentiment_score: null, 
          sentiment_label: null,
          suggested_tags: []
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Initialize OpenAI 
    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY") || "",
    });

    const prompt = `
      Analyze the following employee feedback for sentiment and identify main themes:
      
      Feedback: "${feedback}"
      
      Instructions:
      1. Determine the overall sentiment on a 5-point scale:
         - 5: Very Positive (Emotions: Excited, satisfied, motivated)
         - 4: Positive (Emotions: Happy, content, comfortable)
         - 3: Neutral (Emotions: Indifferent, routine, no specific highs/lows)
         - 2: Negative (Emotions: Frustrated, unsatisfied, unacknowledged)
         - 1: Very Negative (Emotions: Angry, disrespected, anxious)
      
      2. Provide a normalized sentiment score between -1 and 1:
         - 5 corresponds to 1.0
         - 4 corresponds to 0.5
         - 3 corresponds to 0.0
         - 2 corresponds to -0.5
         - 1 corresponds to -1.0
      
      3. Identify the top 1-3 themes from the following options that best match the feedback:
         Training, Manager, Workload, Facilities, Compensation, Team, Career Growth, Work-Life Balance, Communication, Tools
      
      4. Check if there's any urgent issue or abusive language that should be flagged
      
      Format your response as a JSON with the following structure:
      {
        "sentiment_label": "Very Positive/Positive/Neutral/Negative/Very Negative",
        "sentiment_score": 0.0,
        "rating": 1-5,
        "themes": ["theme1", "theme2"],
        "flag_urgent": true/false,
        "flag_abusive": true/false
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const result = completion.choices[0].message.content;
    let parsedResult;
    
    try {
      parsedResult = JSON.parse(result);
    } catch (e) {
      console.error("Failed to parse OpenAI response:", e);
      parsedResult = { 
        sentiment_label: "Neutral", 
        sentiment_score: 0, 
        rating: 3,
        themes: [],
        flag_urgent: false,
        flag_abusive: false
      };
    }

    return new Response(
      JSON.stringify({
        sentiment_score: parsedResult.sentiment_score,
        sentiment_label: parsedResult.sentiment_label,
        rating: parsedResult.rating || 3,
        suggested_tags: parsedResult.themes || [],
        flag_urgent: parsedResult.flag_urgent || false,
        flag_abusive: parsedResult.flag_abusive || false
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error processing sentiment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
