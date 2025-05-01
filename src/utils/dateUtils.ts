
/**
 * Checks if a string is a valid date in YYYY-MM-DD format
 * Also accepts DD/MM/YYYY format and converts it
 */
export const isValidDate = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  
  // Check if date is in DD/MM/YYYY format
  const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  if (ddmmyyyyRegex.test(dateString)) {
    const [_, day, month, year] = ddmmyyyyRegex.exec(dateString) || [];
    // Create a Date object and check if it's valid
    const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    return !isNaN(date.getTime());
  }
  
  // Check for YYYY-MM-DD format
  const yyyymmddRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (yyyymmddRegex.test(dateString)) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
  
  return false;
};

/**
 * Converts a date string from DD/MM/YYYY format to YYYY-MM-DD format if needed
 * If the string is already in YYYY-MM-DD format, it returns it unchanged
 */
export const formatDateToYYYYMMDD = (dateString: string): string => {
  if (!dateString) return '';
  
  // Check if already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Convert from DD/MM/YYYY to YYYY-MM-DD
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  
  // Return original if can't convert
  return dateString;
};

/**
 * Converts a date string from YYYY-MM-DD format to DD/MM/YYYY format
 */
export const formatDateToDDMMYYYY = (dateString: string): string => {
  if (!dateString) return '';
  
  // Check if in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const parts = dateString.split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }
  
  // Return original if can't convert
  return dateString;
};
