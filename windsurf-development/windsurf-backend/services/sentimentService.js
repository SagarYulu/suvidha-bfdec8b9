
class SentimentService {
  constructor() {
    // Emoji to sentiment mapping
    this.emojiSentimentMap = {
      '😡': { sentiment: 'negative', score: 1 },
      '😞': { sentiment: 'negative', score: 2 },
      '😐': { sentiment: 'neutral', score: 3 },
      '😊': { sentiment: 'positive', score: 4 },
      '😍': { sentiment: 'positive', score: 5 }
    };

    // Text-based sentiment keywords
    this.sentimentKeywords = {
      positive: [
        'excellent', 'great', 'amazing', 'wonderful', 'fantastic', 'outstanding',
        'satisfied', 'happy', 'pleased', 'good', 'nice', 'helpful', 'quick',
        'efficient', 'professional', 'friendly', 'thank you', 'thanks'
      ],
      negative: [
        'terrible', 'awful', 'horrible', 'bad', 'worst', 'disappointing',
        'frustrated', 'angry', 'upset', 'slow', 'delayed', 'unprofessional',
        'rude', 'useless', 'poor', 'complaint', 'problem', 'issue'
      ],
      neutral: [
        'okay', 'fine', 'average', 'normal', 'standard', 'acceptable'
      ]
    };
  }

  /**
   * Analyze sentiment from emoji feedback
   */
  analyzeFeedbackSentiment(feedbackOption) {
    if (!feedbackOption) {
      return { sentiment: 'neutral', score: 3, confidence: 0 };
    }

    // Check if it's an emoji
    if (this.emojiSentimentMap[feedbackOption]) {
      const result = this.emojiSentimentMap[feedbackOption];
      return {
        sentiment: result.sentiment,
        score: result.score,
        confidence: 1.0,
        method: 'emoji'
      };
    }

    // Analyze text-based feedback
    return this.analyzeTextSentiment(feedbackOption);
  }

  /**
   * Analyze sentiment from text content
   */
  analyzeTextSentiment(text) {
    if (!text || typeof text !== 'string') {
      return { sentiment: 'neutral', score: 3, confidence: 0 };
    }

    const cleanText = text.toLowerCase().trim();
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    // Count positive keywords
    this.sentimentKeywords.positive.forEach(keyword => {
      if (cleanText.includes(keyword)) {
        positiveCount++;
      }
    });

    // Count negative keywords
    this.sentimentKeywords.negative.forEach(keyword => {
      if (cleanText.includes(keyword)) {
        negativeCount++;
      }
    });

    // Count neutral keywords
    this.sentimentKeywords.neutral.forEach(keyword => {
      if (cleanText.includes(keyword)) {
        neutralCount++;
      }
    });

    // Determine overall sentiment
    let sentiment = 'neutral';
    let score = 3;
    let confidence = 0;

    const totalKeywords = positiveCount + negativeCount + neutralCount;
    
    if (totalKeywords > 0) {
      if (positiveCount > negativeCount && positiveCount > neutralCount) {
        sentiment = 'positive';
        score = Math.min(5, 3 + positiveCount);
        confidence = positiveCount / totalKeywords;
      } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
        sentiment = 'negative';
        score = Math.max(1, 3 - negativeCount);
        confidence = negativeCount / totalKeywords;
      } else {
        sentiment = 'neutral';
        score = 3;
        confidence = neutralCount / totalKeywords;
      }
    }

    // Boost confidence for longer text with clear sentiment
    if (cleanText.length > 50 && totalKeywords > 2) {
      confidence = Math.min(1.0, confidence + 0.2);
    }

    return {
      sentiment,
      score: Math.round(score),
      confidence: Math.round(confidence * 100) / 100,
      method: 'text_analysis',
      keywordCounts: {
        positive: positiveCount,
        negative: negativeCount,
        neutral: neutralCount
      }
    };
  }

  /**
   * Get sentiment distribution for analytics
   */
  async getSentimentDistribution(pool, filters = {}) {
    try {
      const { startDate, endDate, city, cluster } = filters;
      
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (startDate) {
        whereClause += ' AND created_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND created_at <= ?';
        params.push(endDate);
      }

      if (city) {
        whereClause += ' AND city = ?';
        params.push(city);
      }

      if (cluster) {
        whereClause += ' AND cluster = ?';
        params.push(cluster);
      }

      const [results] = await pool.execute(`
        SELECT 
          sentiment,
          COUNT(*) as count,
          AVG(CASE 
            WHEN feedback_option = '😡' THEN 1
            WHEN feedback_option = '😞' THEN 2
            WHEN feedback_option = '😐' THEN 3
            WHEN feedback_option = '😊' THEN 4
            WHEN feedback_option = '😍' THEN 5
            ELSE 3
          END) as avg_score
        FROM ticket_feedback
        ${whereClause}
        GROUP BY sentiment
        ORDER BY sentiment
      `, params);

      // Calculate totals
      const total = results.reduce((sum, row) => sum + row.count, 0);
      
      const distribution = {
        positive: { count: 0, percentage: 0, avgScore: 0 },
        neutral: { count: 0, percentage: 0, avgScore: 0 },
        negative: { count: 0, percentage: 0, avgScore: 0 }
      };

      results.forEach(row => {
        const percentage = total > 0 ? (row.count / total * 100) : 0;
        distribution[row.sentiment] = {
          count: row.count,
          percentage: Math.round(percentage * 100) / 100,
          avgScore: Math.round(row.avg_score * 100) / 100
        };
      });

      return {
        distribution,
        total,
        overallScore: total > 0 
          ? Math.round(results.reduce((sum, row) => sum + (row.avg_score * row.count), 0) / total * 100) / 100
          : 0
      };
    } catch (error) {
      console.error('Error getting sentiment distribution:', error);
      throw error;
    }
  }

  /**
   * Process feedback batch for sentiment analysis
   */
  processFeedbackBatch(feedbackItems) {
    return feedbackItems.map(feedback => {
      const analysis = this.analyzeFeedbackSentiment(feedback.feedback_option);
      return {
        ...feedback,
        sentiment: analysis.sentiment,
        sentimentScore: analysis.score,
        sentimentConfidence: analysis.confidence,
        analysisMethod: analysis.method
      };
    });
  }

  /**
   * Get sentiment trends over time
   */
  async getSentimentTrends(pool, period = 'week', filters = {}) {
    try {
      const { startDate, endDate } = filters;
      
      let dateFormat;
      switch (period) {
        case 'day':
          dateFormat = '%Y-%m-%d';
          break;
        case 'week':
          dateFormat = '%Y-%u'; // Year-Week
          break;
        case 'month':
          dateFormat = '%Y-%m';
          break;
        default:
          dateFormat = '%Y-%m-%d';
      }

      let whereClause = 'WHERE 1=1';
      const params = [];

      if (startDate) {
        whereClause += ' AND created_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND created_at <= ?';
        params.push(endDate);
      }

      const [results] = await pool.execute(`
        SELECT 
          DATE_FORMAT(created_at, ?) as period,
          sentiment,
          COUNT(*) as count,
          AVG(CASE 
            WHEN feedback_option = '😡' THEN 1
            WHEN feedback_option = '😞' THEN 2
            WHEN feedback_option = '😐' THEN 3
            WHEN feedback_option = '😊' THEN 4
            WHEN feedback_option = '😍' THEN 5
            ELSE 3
          END) as avg_score
        FROM ticket_feedback
        ${whereClause}
        GROUP BY period, sentiment
        ORDER BY period, sentiment
      `, [dateFormat, ...params]);

      // Group by period
      const trends = {};
      results.forEach(row => {
        if (!trends[row.period]) {
          trends[row.period] = {
            period: row.period,
            positive: { count: 0, avgScore: 0 },
            neutral: { count: 0, avgScore: 0 },
            negative: { count: 0, avgScore: 0 },
            total: 0
          };
        }
        
        trends[row.period][row.sentiment] = {
          count: row.count,
          avgScore: Math.round(row.avg_score * 100) / 100
        };
        trends[row.period].total += row.count;
      });

      return Object.values(trends);
    } catch (error) {
      console.error('Error getting sentiment trends:', error);
      throw error;
    }
  }
}

module.exports = new SentimentService();
