
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export const useSentiment = () => {
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSentimentData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/sentiment-analysis');
        setSentimentData(response.data);
      } catch (error) {
        console.error('Error fetching sentiment data:', error);
        setError('Failed to fetch sentiment data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSentimentData();
  }, []);

  return {
    sentimentData,
    isLoading,
    error
  };
};
