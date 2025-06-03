
import { api } from '../lib/api';
import { API_ENDPOINTS } from '../config/api';

export const getFeedbackAnalytics = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.ANALYTICS);
    return response.data;
  } catch (error) {
    console.error('Error fetching feedback analytics:', error);
    return null;
  }
};
