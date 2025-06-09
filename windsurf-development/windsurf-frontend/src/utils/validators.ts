
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password: string): boolean => {
    return password.length >= 8;
  },

  employeeId: (employeeId: string): boolean => {
    return employeeId.trim().length > 0;
  },

  required: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },

  phoneNumber: (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  },

  fileSize: (file: File, maxSizeInMB: number): boolean => {
    return file.size <= maxSizeInMB * 1024 * 1024;
  },

  fileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },
};

export default validators;
