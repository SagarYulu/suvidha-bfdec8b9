
class SentimentAnalyzer {
  static async analyzeFeedback(feedbackText) {
    try {
      // Enhanced rule-based sentiment analysis with more sophisticated patterns
      const analysis = this.performTextAnalysis(feedbackText);
      
      return {
        label: analysis.sentiment,
        confidence: analysis.confidence,
        scores: analysis.scores,
        keywords: analysis.keywords,
        emotions: analysis.emotions
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return {
        label: 'neutral',
        confidence: 0.5,
        scores: { positive: 0, negative: 0, neutral: 1 },
        keywords: [],
        emotions: {}
      };
    }
  }

  static performTextAnalysis(text) {
    const normalizedText = text.toLowerCase().trim();
    
    const positiveWords = [
      'excellent', 'great', 'good', 'amazing', 'wonderful', 'fantastic',
      'satisfied', 'happy', 'pleased', 'helpful', 'quick', 'fast',
      'resolved', 'solved', 'efficient', 'professional', 'courteous',
      'outstanding', 'superb', 'brilliant', 'perfect', 'awesome',
      'love', 'appreciate', 'thank', 'grateful'
    ];
    
    const negativeWords = [
      'terrible', 'awful', 'bad', 'horrible', 'disappointed', 'frustrated',
      'angry', 'slow', 'unhelpful', 'rude', 'unprofessional', 'delayed',
      'unresolved', 'poor', 'worst', 'hate', 'disgusted', 'annoyed',
      'useless', 'pathetic', 'ridiculous', 'nightmare', 'disaster'
    ];

    const intensifiers = ['very', 'extremely', 'really', 'totally', 'completely', 'absolutely'];
    const negators = ['not', 'never', 'no', 'without', 'hardly', 'barely'];

    // Split text into words and analyze
    const words = normalizedText.split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;
    let foundKeywords = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[^\w]/g, ''); // Remove punctuation
      
      // Check for intensifiers
      const hasIntensifier = i > 0 && intensifiers.includes(words[i - 1]);
      const multiplier = hasIntensifier ? 2 : 1;
      
      // Check for negators
      const hasNegator = i > 0 && negators.includes(words[i - 1]);
      
      if (positiveWords.includes(word)) {
        foundKeywords.push({ word, sentiment: 'positive' });
        if (hasNegator) {
          negativeScore += 1 * multiplier;
        } else {
          positiveScore += 1 * multiplier;
        }
      } else if (negativeWords.includes(word)) {
        foundKeywords.push({ word, sentiment: 'negative' });
        if (hasNegator) {
          positiveScore += 1 * multiplier;
        } else {
          negativeScore += 1 * multiplier;
        }
      }
    }

    // Calculate sentiment
    let sentiment = 'neutral';
    let confidence = 0.5;
    
    const totalScore = positiveScore + negativeScore;
    
    if (totalScore > 0) {
      const sentimentRatio = (positiveScore - negativeScore) / totalScore;
      
      if (sentimentRatio > 0.2) {
        sentiment = 'positive';
        confidence = Math.min(0.95, 0.5 + Math.abs(sentimentRatio) * 0.5);
      } else if (sentimentRatio < -0.2) {
        sentiment = 'negative';
        confidence = Math.min(0.95, 0.5 + Math.abs(sentimentRatio) * 0.5);
      } else {
        sentiment = 'neutral';
        confidence = 0.6;
      }
    }

    // Detect emotions
    const emotions = this.detectEmotions(normalizedText);

    return {
      sentiment,
      confidence,
      scores: {
        positive: positiveScore,
        negative: negativeScore,
        neutral: totalScore === 0 ? 1 : 0
      },
      keywords: foundKeywords,
      emotions
    };
  }

  static detectEmotions(text) {
    const emotionPatterns = {
      joy: ['happy', 'joyful', 'excited', 'pleased', 'delighted', 'cheerful'],
      anger: ['angry', 'furious', 'mad', 'annoyed', 'irritated', 'frustrated'],
      sadness: ['sad', 'disappointed', 'upset', 'depressed', 'unhappy'],
      fear: ['worried', 'scared', 'anxious', 'nervous', 'concerned'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished'],
      disgust: ['disgusted', 'revolted', 'appalled', 'sickened']
    };

    const emotions = {};
    
    Object.keys(emotionPatterns).forEach(emotion => {
      const score = emotionPatterns[emotion].reduce((count, word) => {
        return count + (text.includes(word) ? 1 : 0);
      }, 0);
      
      if (score > 0) {
        emotions[emotion] = score;
      }
    });

    return emotions;
  }

  static async batchAnalyzeFeedback(feedbackList) {
    const results = [];
    
    for (const feedback of feedbackList) {
      const analysis = await this.analyzeFeedback(feedback.text);
      results.push({
        id: feedback.id,
        analysis
      });
    }
    
    return results;
  }

  static getSentimentTrend(analysisResults) {
    const trend = {
      positive: 0,
      negative: 0,
      neutral: 0,
      total: analysisResults.length
    };

    analysisResults.forEach(result => {
      trend[result.label]++;
    });

    // Calculate percentages
    Object.keys(trend).forEach(key => {
      if (key !== 'total') {
        trend[`${key}_percentage`] = ((trend[key] / trend.total) * 100).toFixed(2);
      }
    });

    return trend;
  }
}

module.exports = SentimentAnalyzer;
