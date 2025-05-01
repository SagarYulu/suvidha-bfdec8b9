
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
    '2345678,YL002,Jane Smith,jane@example.com,9876543211,Delhi,GURGAON,Mark Johnson,Zone Screener,2023-02-20,1992-07-15,B+,23456789012,EFGH0005678,changeme123'
  ].join('\n');

  return csvContent;
};
