
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
  
  // Check for DD-MM-YYYY format
  const ddmmyyyyHyphenRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
  if (ddmmyyyyHyphenRegex.test(dateString)) {
    const [_, day, month, year] = ddmmyyyyHyphenRegex.exec(dateString) || [];
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
 * Converts a date string from any supported format to YYYY-MM-DD format
 * Supports DD/MM/YYYY, DD-MM-YYYY, and YYYY-MM-DD formats
 */
export const formatDateToYYYYMMDD = (dateString: string): string => {
  if (!dateString) return '';
  
  // Check if already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Convert from DD/MM/YYYY to YYYY-MM-DD
  const slashPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  if (slashPattern.test(dateString)) {
    const match = slashPattern.exec(dateString);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];
      return `${year}-${month}-${day}`;
    }
  }
  
  // Convert from DD-MM-YYYY to YYYY-MM-DD
  const hyphenPattern = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
  if (hyphenPattern.test(dateString)) {
    const match = hyphenPattern.exec(dateString);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];
      return `${year}-${month}-${day}`;
    }
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
