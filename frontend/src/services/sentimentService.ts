
import { apiCall } from '@/config/api';
import { SentimentEntry, SentimentAlert, SentimentFilters } from '@/types/sentimentTypes';

export type { SentimentEntry, SentimentAlert, SentimentFilters };

export const fetchSentimentData = async (filters?: SentimentFilters): Promise<SentimentEntry[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/sentiment/data${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiCall(endpoint);
    return response.data || response || [];
  } catch (error) {
    console.error('Error fetching sentiment data:', error);
    throw error;
  }
};

export const fetchSentimentAlerts = async (showResolved = false): Promise<SentimentAlert[]> => {
  try {
    const response = await apiCall(`/sentiment/alerts?resolved=${showResolved}`);
    return response.data || response || [];
  } catch (error) {
    console.error('Error fetching sentiment alerts:', error);
    throw error;
  }
};

export const resolveSentimentAlert = async (alertId: string): Promise<void> => {
  try {
    await apiCall(`/sentiment/alerts/${alertId}/resolve`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error resolving sentiment alert:', error);
    throw error;
  }
};
