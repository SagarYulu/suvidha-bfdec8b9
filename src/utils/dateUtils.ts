
import { format, parse } from 'date-fns';

export const formatDateToDDMMYYYY = (dateString: string): string => {
  try {
    // Try to parse the date string (handles various formats)
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return format(date, 'dd-MM-yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

export const formatDateToISO = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    return date.toISOString();
  } catch (error) {
    console.error('Error formatting date to ISO:', error);
    return '';
  }
};
