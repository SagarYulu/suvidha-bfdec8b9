
// Chart utility functions and constants
export const SENTIMENT_COLORS = {
  happy: '#22c55e',     // Green
  neutral: '#eab308',   // Yellow  
  sad: '#ef4444',       // Red
  positive: '#22c55e',  // Green
  negative: '#ef4444',  // Red
} as const;

export const getSentimentColor = (sentiment: string): string => {
  const normalizedSentiment = sentiment?.toLowerCase();
  
  if (normalizedSentiment?.includes('happy') || normalizedSentiment?.includes('positive')) {
    return SENTIMENT_COLORS.happy;
  }
  if (normalizedSentiment?.includes('sad') || normalizedSentiment?.includes('negative')) {
    return SENTIMENT_COLORS.sad;
  }
  return SENTIMENT_COLORS.neutral;
};

export const hasData = (data: any[] | undefined): data is any[] => {
  return Array.isArray(data) && data.length > 0;
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat().format(value);
};
