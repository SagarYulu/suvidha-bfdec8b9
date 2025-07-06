
import { ApiClient } from './apiClient';

export interface SentimentFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  city?: string;
  cluster?: string;
}

class SentimentServiceClass {
  async getSentimentOverview(filters: SentimentFilters = {}) {
    try {
      const response = await ApiClient.post('/api/sentiment/overview', filters);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch sentiment overview');
    }
  }

  async getSentimentDistribution(filters: SentimentFilters = {}) {
    try {
      const response = await ApiClient.post('/api/sentiment/distribution', filters);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch sentiment distribution');
    }
  }

  async getMoodTrend(filters: SentimentFilters = {}) {
    try {
      const response = await ApiClient.post('/api/sentiment/mood-trend', filters);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch mood trend');
    }
  }

  async getTopicAnalysis(filters: SentimentFilters = {}) {
    try {
      const response = await ApiClient.post('/api/sentiment/topics', filters);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch topic analysis');
    }
  }
}

export const SentimentService = new SentimentServiceClass();
