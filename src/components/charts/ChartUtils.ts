
// Define sentiment colors for consistency
export const SENTIMENT_COLORS = {
  positive: '#4ADE80', // Green
  neutral: '#FBBF24',  // Yellow
  negative: '#F87171', // Red
  unknown: '#9CA3AF'   // Gray
};

// Additional colors for other categories if needed
export const CHART_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#A855F7', // Violet
  '#6366F1', // Indigo
  '#0EA5E9', // Sky
  '#F59E0B'  // Amber
];

// Helper function for mood tooltip formatting
export const moodTooltipFormatter = (value: number, name: string) => {
  const nameMap = {
    rating: 'Current Period',
    previousRating: 'Previous Period'
  };
  
  return [value.toFixed(1), nameMap[name as keyof typeof nameMap] || name];
};

// Helper function to map sentiment labels to colors
export const getSentimentColor = (sentimentLabel: string): string => {
  const label = sentimentLabel.toLowerCase();
  
  if (label.includes('positive')) return SENTIMENT_COLORS.positive;
  if (label.includes('negative')) return SENTIMENT_COLORS.negative;
  if (label.includes('neutral')) return SENTIMENT_COLORS.neutral;
  return SENTIMENT_COLORS.unknown;
};

// Helper function to get percentage change text with color
export const getChangeText = (current: number, previous: number): { text: string, color: string } => {
  if (!previous) return { text: 'N/A', color: 'text-gray-500' };
  
  const change = ((current - previous) / previous) * 100;
  let text = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
  let color = 'text-gray-500';
  
  if (change > 0) color = 'text-green-600';
  if (change < 0) color = 'text-red-600';
  
  return { text, color };
};

// Format date in a consistent way
export const formatChartDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    console.error("Date formatting error:", e);
    return dateString;
  }
};

// Check if a date is within a specific range
export const isDateInRange = (dateStr: string, startDate?: string, endDate?: string): boolean => {
  if (!dateStr) return false;
  if (!startDate && !endDate) return true;
  
  const date = new Date(dateStr);
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  let isInRange = true;
  
  if (startDate) {
    const start = new Date(startDate);
    isInRange = isInRange && dateOnly >= start;
  }
  
  if (endDate) {
    const end = new Date(endDate);
    // Make the end date inclusive by adding a day
    end.setDate(end.getDate() + 1);
    isInRange = isInRange && dateOnly < end;
  }
  
  return isInRange;
};
