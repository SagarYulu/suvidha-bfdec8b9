// Helper functions for date formatting and validation

/**
 * Validates a date string in various formats
 */
export const isValidDate = (dateStr: string | null | undefined): boolean => {
  if (!dateStr) return true; // Optional field
  
  // Support various date formats including DD/MM/YYYY, DD-MM-YYYY, and YYYY-MM-DD
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    /^\d{2}\/\d{2}\/\d{4}$/ // DD/MM/YYYY
  ];
  
  if (!datePatterns.some(pattern => pattern.test(dateStr))) {
    return false;
  }
  
  // Check that the date components make sense
  let day, month, year;
  
  if (dateStr.includes('-')) {
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // YYYY-MM-DD format
      [year, month, day] = dateStr.split('-').map(Number);
    } else {
      // DD-MM-YYYY format
      [day, month, year] = dateStr.split('-').map(Number);
    }
  } else if (dateStr.includes('/')) {
    // DD/MM/YYYY format
    [day, month, year] = dateStr.split('/').map(Number);
  } else {
    return false;
  }
  
  // Validate date components
  if (month < 1 || month > 12) return false;
  
  // Check days in month (accounting for leap years)
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
    daysInMonth[2] = 29; // Leap year
  }
  
  return day >= 1 && day <= daysInMonth[month];
};

/**
 * Convert date from any supported format to DD-MM-YYYY
 */
export const formatDateToDDMMYYYY = (dateStr: string | null): string | null => {
  if (!dateStr) return null;
  
  let day, month, year;
  
  // Handle different formats
  if (dateStr.includes('-')) {
    if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
      // Already in DD-MM-YYYY format
      return dateStr;
    } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Convert from YYYY-MM-DD to DD-MM-YYYY
      [year, month, day] = dateStr.split('-');
      return `${day}-${month}-${year}`;
    }
  } else if (dateStr.includes('/')) {
    // Convert from DD/MM/YYYY to DD-MM-YYYY
    [day, month, year] = dateStr.split('/');
    return `${day}-${month}-${year}`;
  }
  
  // Try to parse using Date constructor as fallback
  try {
    const date = new Date(dateStr);
    if (date instanceof Date && !isNaN(date.getTime())) {
      day = String(date.getDate()).padStart(2, '0');
      month = String(date.getMonth() + 1).padStart(2, '0');
      year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch (e) {
    // If parsing fails, return original
  }
  
  return dateStr; // Return original if can't parse
};

/**
 * Convert date from various formats to YYYY-MM-DD for database storage
 */
export const formatDateToYYYYMMDD = (dateStr: string | null): string | null => {
  if (!dateStr) return null;
  
  // If already in YYYY-MM-DD format
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }
  
  let day, month, year;
  
  // Convert from DD-MM-YYYY to YYYY-MM-DD
  if (dateStr.match(/^\d{2}-\d{2}-\d{4}$/)) {
    [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  }
  
  // Convert from DD/MM/YYYY to YYYY-MM-DD
  if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }
  
  // Try to parse using Date constructor as fallback
  try {
    const date = new Date(dateStr);
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // Get YYYY-MM-DD portion
    }
  } catch (e) {
    // If parsing fails, return original
  }
  
  return dateStr; // Return original if can't parse
};

/**
 * Format date or timestamp to a human-readable "time ago" format
 * e.g. "2 hours ago", "3 days ago", "just now"
 */
export const formatTimeAgo = (dateStr: string | Date | null): string => {
  if (!dateStr) return 'Unknown date';
  
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than a minute
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Less than a month
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  
  // Less than a year
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  
  // More than a year
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};
