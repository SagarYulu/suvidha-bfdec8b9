
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export class Validator {
  private rules: { [key: string]: ValidationRule } = {};
  private errors: ValidationErrors = {};

  constructor(rules: { [key: string]: ValidationRule } = {}) {
    this.rules = rules;
  }

  validate(data: { [key: string]: any }): ValidationErrors {
    this.errors = {};

    Object.keys(this.rules).forEach(field => {
      const rule = this.rules[field];
      const value = data[field];

      this.validateField(field, value, rule);
    });

    return this.errors;
  }

  private validateField(field: string, value: any, rule: ValidationRule) {
    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      this.errors[field] = `${field} is required`;
      return;
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return;
    }

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      this.errors[field] = `${field} must be at least ${rule.minLength} characters`;
      return;
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      this.errors[field] = `${field} must not exceed ${rule.maxLength} characters`;
      return;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      this.errors[field] = `${field} format is invalid`;
      return;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        this.errors[field] = customError;
        return;
      }
    }
  }

  isValid(): boolean {
    return Object.keys(this.errors).length === 0;
  }

  getErrors(): ValidationErrors {
    return this.errors;
  }

  getError(field: string): string | null {
    return this.errors[field] || null;
  }
}

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  employeeId: /^[A-Za-z0-9]{4,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
};

// Common validation rules
export const CommonRules = {
  email: {
    required: true,
    pattern: ValidationPatterns.email
  },
  phone: {
    required: true,
    pattern: ValidationPatterns.phone
  },
  employeeId: {
    required: true,
    pattern: ValidationPatterns.employeeId
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 1000
  }
};
