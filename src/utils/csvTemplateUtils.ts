
/**
 * Generates a CSV template for employee data import
 */
export const getCSVTemplate = () => {
  // Ensure headers match exactly with manual entry form fields and database columns
  const headers = [
    'id',           // UUID (auto-generated, can be left empty)
    'User ID',      // Manual User ID (numeric, required)
    'emp_id',       // Employee ID (required)
    'name',         // Name (required)
    'email',        // Email (required)
    'phone',        // Phone
    'city',         // City (now required)
    'cluster',      // Cluster (now required)
    'manager',      // Manager (now required)
    'role',         // Role (required)
    'password'      // Password
  ];

  // Ensure the examples use valid roles from ROLE_OPTIONS
  const csvContent = [
    headers.join(','),
    ',1234567,YL001,John Doe,john@yulu.com,9876543210,Bangalore,Koramangala,Jane Smith,Mechanic,changeme123',
    ',2345678,YL002,Jane Smith,jane@yulu.com,9876543211,Delhi,GURGAON,Mark Johnson,Zone Screener,changeme123'
  ].join('\n');

  return csvContent;
};
