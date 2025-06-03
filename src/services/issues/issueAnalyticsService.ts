
import { api } from '../../lib/api';
import { API_ENDPOINTS } from '../../config/api';

export const getAnalytics = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.ANALYTICS);
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
};
