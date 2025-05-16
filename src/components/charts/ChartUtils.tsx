
import { format } from 'date-fns';

// Common chart colors
export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
export const SENTIMENT_COLORS = {
  'positive': '#4ADE80',  // Lighter green
  'neutral': '#FBBF24',   // Lighter yellow
  'negative': '#F87171'   // Lighter red
};

// Helper function to get sentiment color based on name
export const getSentimentColor = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('positive')) return SENTIMENT_COLORS.positive;
  if (lowerName.includes('negative')) return SENTIMENT_COLORS.negative;
  if (lowerName.includes('neutral')) return SENTIMENT_COLORS.neutral;
  return CHART_COLORS[0]; // Default color
};

// Formatter for the line chart tooltips
export const moodTooltipFormatter = (value: number, name: string) => {
  const moodLabels: Record<number, string> = {
    1: 'Very Low',
    2: 'Low',
    3: 'Neutral',
    4: 'Good',
    5: 'Excellent'
  };
  
  const closestMood = Object.keys(moodLabels)
    .map(Number)
    .reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    }, 3);
    
  return [`${value} (${moodLabels[closestMood]})`, "Mood Rating"];
};

/**
 * Safe formatter for LabelList to ensure it returns string | number
 * This function correctly handles different input types including arrays
 * @param value Any value that needs to be formatted
 * @returns Formatted value as string or number
 */
export const labelFormatter = (value: any): string | number => {
  // Check if the value is undefined or null and return a default value
  if (value === undefined || value === null) {
    return '0';
  }
  
  // If the value is an array, convert the first item to a string
  if (Array.isArray(value)) {
    return value.length > 0 ? String(value[0]) : '0';
  }
  
  // For numbers and strings, return directly
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  
  // For other types, convert to string
  return String(value);
};

