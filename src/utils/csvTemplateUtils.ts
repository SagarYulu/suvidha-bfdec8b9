
/**
 * Generates a CSV template for employee data import
 */
export const getCSVTemplate = () => {
  // Headers match exactly with the database columns and UI fields
  const headers = [
    'User ID',
    'emp_id',
    'name',
    'email',
    'phone',
    'city',
    'cluster',
    'manager',
    'role',
    'date_of_joining',
    'date_of_birth',
    'blood_group',
    'account_number',
    'ifsc_code',
    'password'
  ];

  // Example data that matches the required format
  const csvContent = [
    headers.join(','),
    '1234567,YL001,John Doe,john@example.com,9876543210,Bangalore,Koramangala,Jane Smith,Mechanic,2023-01-15,1990-05-20,O+,12345678901,ABCD0001234,changeme123',
    '2345678,YL002,Jane Smith,jane@example.com,9876543211,Delhi,GURGAON,Mark Johnson,Zone Screener,2023-02-20,1992-07-15,B+,23456789012,EFGH0005678,changeme123',
    '',
    '# Important Notes:',
    '# 1. User ID must be numeric (e.g., 1234567)',
    '# 2. Required fields: User ID, emp_id, name, email, city, cluster, manager, role',
    '# 3. Date format: Use YYYY-MM-DD format (e.g., 2023-01-15) or DD/MM/YYYY format (e.g., 15/01/2023)',
    '# 4. Employee roles can be any string value. Common examples include: Customer Service, Supervisor, Team Lead, Project Manager, etc.',
    '# 5. If password is not provided, it defaults to "changeme123"',
    '# 6. For two-digit years (e.g., 15/06/96), years > 50 are treated as 19xx and years <= 50 are treated as 20xx'
  ].join('\n');

  return csvContent;
};
