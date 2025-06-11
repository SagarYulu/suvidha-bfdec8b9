
import { format, parseISO } from 'date-fns';

export const formatDate = (dateString: string, formatStr: string = 'MMM dd') => {
  try {
    return format(parseISO(dateString), formatStr);
  } catch {
    return dateString;
  }
};

export const formatNumber = (value: number, decimals: number = 0) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercentage = (value: number, decimals: number = 1) => {
  return `${formatNumber(value, decimals)}%`;
};

export const getColorByIndex = (index: number, colors?: string[]) => {
  const defaultColors = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'
  ];
  const colorArray = colors || defaultColors;
  return colorArray[index % colorArray.length];
};

export const hasData = (data: any[] | undefined | null): boolean => {
  return Array.isArray(data) && data.length > 0;
};

export const truncateText = (text: string, maxLength: number = 20) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Sentiment colors - mapped to happy/neutral/sad instead of positive/negative
export const SENTIMENT_COLORS = {
  positive: '#22C55E',
  negative: '#EF4444',
  neutral: '#6B7280',
  mixed: '#F59E0B',
  happy: '#22C55E',
  sad: '#EF4444'
};

export const getSentimentColor = (sentiment: string): string => {
  const normalizedSentiment = sentiment.toLowerCase();
  if (normalizedSentiment.includes('happy') || normalizedSentiment.includes('positive')) {
    return SENTIMENT_COLORS.happy;
  }
  if (normalizedSentiment.includes('sad') || normalizedSentiment.includes('negative')) {
    return SENTIMENT_COLORS.sad;
  }
  return SENTIMENT_COLORS.neutral;
};

export const CURVED_LINE_TYPE = 'monotone';
