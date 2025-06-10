
class SentimentAnalyzer {
  static async analyzeFeedback(feedbackText) {
    try {
      // Simple rule-based sentiment analysis
      // In production, you'd use a proper NLP service like OpenAI, Google Cloud NLP, etc.
      
      const positiveWords = [
        'excellent', 'great', 'good', 'amazing', 'wonderful', 'fantastic',
        'satisfied', 'happy', 'pleased', 'helpful', 'quick', 'fast',
        'resolved', 'solved', 'efficient', 'professional', 'courteous'
      ];
      
      const negativeWords = [
        'terrible', 'awful', 'bad', 'horrible', 'disappointed', 'frustrated',
        'angry', 'slow', 'unhelpful', 'rude', 'unprofessional', 'delayed',
        'unresolved', 'poor', 'worst', 'hate', 'disgusted'
      ];
      
      const text = feedbackText.toLowerCase();
      
      let positiveScore = 0;
      let negativeScore = 0;
      
      positiveWords.forEach(word => {
        if (text.includes(word)) {
          positiveScore++;
        }
      });
      
      negativeWords.forEach(word => {
        if (text.includes(word)) {
          negativeScore++;
        }
      });
      
      let sentiment = 'neutral';
      let confidence = 0.5;
      
      if (positiveScore > negativeScore) {
        sentiment = 'positive';
        confidence = Math.min(0.9, 0.5 + (positiveScore - negativeScore) * 0.1);
      } else if (negativeScore > positiveScore) {
        sentiment = 'negative';
        confidence = Math.min(0.9, 0.5 + (negativeScore - positiveScore) * 0.1);
      }
      
      return {
        label: sentiment,
        confidence: confidence,
        scores: {
          positive: positiveScore,
          negative: negativeScore,
          neutral: positiveScore === negativeScore ? 1 : 0
        }
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return {
        label: 'neutral',
        confidence: 0.5,
        scores: { positive: 0, negative: 0, neutral: 1 }
      };
    }
  }
}

module.exports = SentimentAnalyzer;
