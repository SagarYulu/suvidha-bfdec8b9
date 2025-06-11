
interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'select';
  required: boolean;
  options?: string[];
  example?: string;
}

export const userTemplateFields: TemplateField[] = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    example: 'John Doe'
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: true,
    example: 'john.doe@company.com'
  },
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'phone',
    required: true,
    example: '+91-9876543210'
  },
  {
    name: 'employeeId',
    label: 'Employee ID',
    type: 'text',
    required: true,
    example: 'EMP001'
  },
  {
    name: 'city',
    label: 'City',
    type: 'select',
    required: true,
    options: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune'],
    example: 'Mumbai'
  },
  {
    name: 'cluster',
    label: 'Cluster',
    type: 'select',
    required: true,
    options: ['North', 'South', 'East', 'West', 'Central'],
    example: 'West'
  },
  {
    name: 'manager',
    label: 'Manager Name',
    type: 'text',
    required: false,
    example: 'Jane Smith'
  }
];

export const generateCSVTemplate = (fields: TemplateField[]): string => {
  const headers = fields.map(field => field.name);
  const examples = fields.map(field => field.example || '');
  
  return [
    headers.join(','),
    examples.join(',')
  ].join('\n');
};

export const downloadTemplate = (fields: TemplateField[], filename: string): void => {
  const csvContent = generateCSVTemplate(fields);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const validateTemplateFormat = (csvText: string, expectedFields: TemplateField[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 1) {
      errors.push('CSV file is empty');
      return { isValid: false, errors, warnings };
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
    const expectedHeaders = expectedFields.map(f => f.name);
    const requiredHeaders = expectedFields.filter(f => f.required).map(f => f.name);
    
    // Check for missing required headers
    const missingRequired = requiredHeaders.filter(header => !headers.includes(header));
    if (missingRequired.length > 0) {
      errors.push(`Missing required columns: ${missingRequired.join(', ')}`);
    }
    
    // Check for extra headers
    const extraHeaders = headers.filter(header => !expectedHeaders.includes(header));
    if (extraHeaders.length > 0) {
      warnings.push(`Extra columns found (will be ignored): ${extraHeaders.join(', ')}`);
    }
    
    // Check for data rows
    if (lines.length < 2) {
      errors.push('CSV file must contain at least one data row');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
    
  } catch (error) {
    errors.push('Failed to parse CSV file. Please check the format.');
    return { isValid: false, errors, warnings };
  }
};
