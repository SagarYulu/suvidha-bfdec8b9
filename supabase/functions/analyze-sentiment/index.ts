
// Using the correct import syntax for Deno standard library
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface RequestData {
  feedback: string
}

function analyzeSentimentText(text: string) {
  // Simple word-based sentiment analysis
  const positiveWords = ['good', 'great', 'excellent', 'happy', 'satisfied', 'enjoy', 'like', 'love', 'appreciate', 'perfect', 'helpful']
  const negativeWords = ['bad', 'poor', 'terrible', 'unhappy', 'disappointed', 'hate', 'dislike', 'awful', 'horrible', 'worst', 'issue', 'problem']

  const words = text.toLowerCase().split(/\W+/)
  let positiveCount = 0
  let negativeCount = 0

  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++
    if (negativeWords.includes(word)) negativeCount++
  })

  // Calculate sentiment score between -1 and 1
  let sentimentScore = 0
  if (positiveCount + negativeCount > 0) {
    sentimentScore = (positiveCount - negativeCount) / (positiveCount + negativeCount)
  }

  // Determine sentiment label
  let sentimentLabel = 'neutral'
  if (sentimentScore > 0.2) sentimentLabel = 'positive'
  else if (sentimentScore < -0.2) sentimentLabel = 'negative'

  // Suggest rating between 1-5 based on sentiment
  let suggestedRating
  if (sentimentScore > 0.6) suggestedRating = 5
  else if (sentimentScore > 0.2) suggestedRating = 4
  else if (sentimentScore > -0.2) suggestedRating = 3
  else if (sentimentScore > -0.6) suggestedRating = 2
  else suggestedRating = 1

  // Identify possible tags based on content
  const suggestedTags = []
  
  if (/\b(pay|salary|compensation|bonus|money)\b/i.test(text)) suggestedTags.push('Compensation')
  if (/\b(manager|supervisor|leadership|boss)\b/i.test(text)) suggestedTags.push('Manager')
  if (/\b(team|colleague|coworker)\b/i.test(text)) suggestedTags.push('Team')
  if (/\b(hour|overtime|schedule|time|weekend)\b/i.test(text)) suggestedTags.push('Work-Life Balance')
  if (/\b(growth|learn|advance|promotion|career|opportunity)\b/i.test(text)) suggestedTags.push('Career Growth')
  if (/\b(difficult|challenge|stress|pressure|workload)\b/i.test(text)) suggestedTags.push('Workload')
  if (/\b(communication|update|inform|unclear)\b/i.test(text)) suggestedTags.push('Communication')

  // Flag urgent issues
  const urgentFlags = /\b(urgent|emergency|immediate|unsafe|danger|harassment|discrimination)\b/i.test(text)
  
  // Flag potential abusive content
  const abusiveFlags = /\b(hate|fire|quit|resign|awful|terrible|horrible)\b/i.test(text)

  return {
    sentiment_score: sentimentScore,
    sentiment_label: sentimentLabel,
    rating: suggestedRating,
    suggested_tags: suggestedTags,
    flag_urgent: urgentFlags,
    flag_abusive: abusiveFlags
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  try {
    const requestData: RequestData = await req.json()
    const { feedback } = requestData
    
    if (!feedback) {
      return new Response(JSON.stringify({ 
        error: "Feedback text is required" 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    const result = analyzeSentimentText(feedback)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Failed to process request" 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
})
