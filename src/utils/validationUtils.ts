
import { type Tables } from '@/integrations/supabase/types';
import { ROLE_OPTIONS, CITY_OPTIONS, CLUSTER_OPTIONS } from '@/data/formOptions';
import { isValidDate } from './dateUtils';

// Update EmployeeData type to include id
type EmployeeData = Omit<Tables<'employees'>, 'created_at' | 'updated_at'>;

/**
 * Validates if a string is a valid user ID (numeric value)
 */
export const isValidUserID = (userId: string): boolean => {
  // User ID should be a numeric string
  return /^\d+$/.test(userId);
};

/**
 * Validates employee data fields and returns validation results
 */
export const validateEmployeeData = (data: Partial<EmployeeData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required fields - check for userId as well
  const requiredFields = ['userId', 'emp_id', 'name', 'email', 'role'];
  const missingFields = requiredFields.filter(field => 
    field === 'userId' ? !data.user_id : !data[field as keyof EmployeeData]
  );
  
  if (missingFields.length > 0) {
    errors.push(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  // User ID validation (if provided)
  if (data.user_id && !isValidUserID(data.user_id)) {
    errors.push(`Invalid User ID format: ${data.user_id}. Must be numeric.`);
  }
  
  // Role validation
  if (data.role) {
    const validRoles = ROLE_OPTIONS.map(r => r.toLowerCase());
    if (!validRoles.includes(data.role.toLowerCase())) {
      errors.push(`Invalid role: ${data.role}. Valid options are: ${ROLE_OPTIONS.join(', ')}`);
    }
  }

  // City validation (if provided)
  if (data.city) {
    const validCities = CITY_OPTIONS.map(c => c.toLowerCase());
    if (!validCities.includes(data.city.toLowerCase())) {
      errors.push(`Invalid city: ${data.city}. Valid options are: ${CITY_OPTIONS.join(', ')}`);
    }
  }

  // Cluster validation (if city and cluster are provided)
  if (data.city && data.cluster) {
    const cityKey = CITY_OPTIONS.find(c => c.toLowerCase() === data.city?.toLowerCase());
    if (cityKey && CLUSTER_OPTIONS[cityKey]) {
      const validClusters = CLUSTER_OPTIONS[cityKey].map(c => c.toLowerCase());
      if (!validClusters.includes(data.cluster.toLowerCase())) {
        errors.push(`Invalid cluster: ${data.cluster} for city: ${data.city}. Valid options are: ${CLUSTER_OPTIONS[cityKey].join(', ')}`);
      }
    }
  }

  // Email format validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push(`Invalid email format: ${data.email}`);
  }

  // Date format validation for optional date fields
  if (data.date_of_joining && !isValidDate(data.date_of_joining)) {
    errors.push(`Invalid date of joining: ${data.date_of_joining}. Use format DD-MM-YYYY or DD/MM/YYYY.`);
  }

  if (data.date_of_birth && !isValidDate(data.date_of_birth)) {
    errors.push(`Invalid date of birth: ${data.date_of_birth}. Use format DD-MM-YYYY or DD/MM/YYYY.`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
