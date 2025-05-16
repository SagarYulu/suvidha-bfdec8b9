
import { format } from 'date-fns';

// Common chart colors
export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
export const SENTIMENT_COLORS = {
  'positive': '#4ADE80',  // Lighter green
  'neutral': '#FBBF24',   // Lighter yellow
  'negative': '#F87171'   // Lighter red
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

// Safe formatter for LabelList to ensure it returns string | number
export const labelFormatter = (value: any): string | number => {
  if (Array.isArray(value)) {
    return String(value[0] || 0);
  }
  return typeof value === 'string' || typeof value === 'number' ? value : String(value);
};
