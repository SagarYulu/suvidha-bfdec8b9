
/**
 * Check if a string is a valid date in YYYY-MM-DD format
 */
export const isValidDate = (dateString: string): boolean => {
  if (!dateString) return true; // Allow empty strings
  
  // Check format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString) && 
      !/^\d{2}\/\d{2}\/\d{2}$/.test(dateString) && // Also allow DD/MM/YY format
      !/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) { // Also allow DD/MM/YYYY format
    return false;
  }
  
  // Parse the date based on its format
  let year, month, day;
  
  if (dateString.includes('-')) {
    // YYYY-MM-DD format
    const parts = dateString.split('-');
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS Date
    day = parseInt(parts[2], 10);
  } else {
    // DD/MM/YY or DD/MM/YYYY format
    const parts = dateString.split('/');
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    year = parseInt(parts[2], 10);
    
    // If year is in YY format, convert to YYYY
    if (year < 100) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }
  }
  
  const date = new Date(year, month, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
};

/**
 * Format date from YYYY-MM-DD to DD/MM/YYYY
 */
export const formatDateToDDMMYYYY = (dateString?: string): string => {
  if (!dateString) return '';
  
  // If already in DD/MM/YYYY format, return as is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString) || /^\d{2}\/\d{2}\/\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

/**
 * Format date from DD/MM/YYYY to YYYY-MM-DD
 */
export const formatDateToYYYYMMDD = (dateString?: string): string => {
  if (!dateString) return '';
  
  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  const parts = dateString.split('/');
  if (parts.length !== 3) return dateString;
  
  // Handle both YY and YYYY formats
  let year = parts[2];
  if (year.length === 2) {
    const numYear = parseInt(year, 10);
    year = numYear < 50 ? `20${year}` : `19${year}`;
  }
  
  return `${year}-${parts[1]}-${parts[0]}`;
};
