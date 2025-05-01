
/**
 * Check if a string is a valid date in YYYY-MM-DD format
 */
export const isValidDate = (dateString: string): boolean => {
  if (!dateString) return true; // Allow empty strings
  
  // Check format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }
  
  // Check if date is valid
  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS Date
  const day = parseInt(parts[2], 10);
  
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
  
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

/**
 * Format date from DD/MM/YYYY to YYYY-MM-DD
 */
export const formatDateToYYYYMMDD = (dateString?: string): string => {
  if (!dateString) return '';
  
  const parts = dateString.split('/');
  if (parts.length !== 3) return dateString;
  
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};
