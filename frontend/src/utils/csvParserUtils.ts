
interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'email' | 'phone' | 'string' | 'number';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  unique?: boolean;
}

interface ParsedRow {
  rowNumber: number;
  data: Record<string, string>;
  isValid: boolean;
  errors: string[];
}

export class CSVParser {
  private rules: ValidationRule[];
  private uniqueFields: Set<string>;

  constructor(rules: ValidationRule[]) {
    this.rules = rules;
    this.uniqueFields = new Set();
  }

  parseAndValidate(csvText: string): {
    validRows: ParsedRow[];
    invalidRows: ParsedRow[];
    summary: {
      totalRows: number;
      validRows: number;
      invalidRows: number;
    };
  } {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = this.parseCSVLine(lines[0]);
    const allRows: ParsedRow[] = [];
    const uniqueTracker: Record<string, Set<string>> = {};

    // Initialize unique field trackers
    this.rules.forEach(rule => {
      if (rule.unique) {
        uniqueTracker[rule.field] = new Set();
      }
    });

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      const parsedRow: ParsedRow = {
        rowNumber: i,
        data: row,
        isValid: true,
        errors: []
      };

      // Validate row
      this.validateRow(parsedRow, uniqueTracker);
      allRows.push(parsedRow);
    }

    const validRows = allRows.filter(row => row.isValid);
    const invalidRows = allRows.filter(row => !row.isValid);

    return {
      validRows,
      invalidRows,
      summary: {
        totalRows: allRows.length,
        validRows: validRows.length,
        invalidRows: invalidRows.length
      }
    };
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  private validateRow(row: ParsedRow, uniqueTracker: Record<string, Set<string>>): void {
    this.rules.forEach(rule => {
      const value = row.data[rule.field];
      
      // Required field check
      if (rule.required && (!value || value.trim() === '')) {
        row.errors.push(`${rule.field} is required`);
        row.isValid = false;
        return;
      }

      if (!value || value.trim() === '') {
        return; // Skip other validations for empty non-required fields
      }

      // Type validation
      if (rule.type) {
        if (!this.validateType(value, rule.type)) {
          row.errors.push(`${rule.field} must be a valid ${rule.type}`);
          row.isValid = false;
        }
      }

      // Length validation
      if (rule.minLength && value.length < rule.minLength) {
        row.errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
        row.isValid = false;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        row.errors.push(`${rule.field} must be no more than ${rule.maxLength} characters`);
        row.isValid = false;
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        row.errors.push(`${rule.field} format is invalid`);
        row.isValid = false;
      }

      // Unique validation
      if (rule.unique) {
        if (uniqueTracker[rule.field].has(value.toLowerCase())) {
          row.errors.push(`${rule.field} must be unique (duplicate found)`);
          row.isValid = false;
        } else {
          uniqueTracker[rule.field].add(value.toLowerCase());
        }
      }
    });
  }

  private validateType(value: string, type: string): boolean {
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'phone':
        return /^\+?[\d\s\-\(\)]{10,}$/.test(value);
      case 'number':
        return !isNaN(Number(value));
      case 'string':
        return typeof value === 'string';
      default:
        return true;
    }
  }
}

export const userValidationRules: ValidationRule[] = [
  { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100 },
  { field: 'email', required: true, type: 'email', unique: true },
  { field: 'phone', required: true, type: 'phone' },
  { field: 'employeeId', required: true, type: 'string', minLength: 3, unique: true },
  { field: 'city', required: true, type: 'string', minLength: 2 },
  { field: 'cluster', required: true, type: 'string', minLength: 2 }
];
