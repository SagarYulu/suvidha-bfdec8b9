
export const formatters = {
  currency: (amount: number, currency = 'INR'): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  date: (date: string | Date, format = 'short'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (format === 'short') {
      return dateObj.toLocaleDateString('en-IN');
    } else if (format === 'long') {
      return dateObj.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else if (format === 'datetime') {
      return dateObj.toLocaleString('en-IN');
    }
    
    return dateObj.toLocaleDateString('en-IN');
  },

  fileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  truncateText: (text: string, maxLength: number): string => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  },

  capitalizeFirst: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  phoneNumber: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  },
};

export default formatters;
