
export const CITY_OPTIONS = [
  'Bangalore',
  'Delhi',
  'Mumbai',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Lucknow'
];

export const CLUSTER_OPTIONS: Record<string, string[]> = {
  'Bangalore': ['Whitefield', 'Electronic City', 'Koramangala', 'BTM Layout', 'HSR Layout'],
  'Delhi': ['Connaught Place', 'Gurgaon', 'Noida', 'Dwarka', 'Lajpat Nagar'],
  'Mumbai': ['Andheri', 'Bandra', 'Lower Parel', 'Powai', 'Thane'],
  'Hyderabad': ['Hitech City', 'Gachibowli', 'Madhapur', 'Secunderabad', 'Jubilee Hills'],
  'Chennai': ['OMR', 'Anna Nagar', 'T Nagar', 'Velachery', 'Porur'],
  'Pune': ['Hinjewadi', 'Kharadi', 'Viman Nagar', 'Aundh', 'Magarpatta'],
  'Kolkata': ['Salt Lake', 'Park Street', 'Sector V', 'New Town', 'Rajarhat'],
  'Ahmedabad': ['Satellite', 'Vastrapur', 'SG Highway', 'Prahlad Nagar', 'Bopal'],
  'Jaipur': ['Malviya Nagar', 'C Scheme', 'Vaishali Nagar', 'Mansarovar', 'Jagatpura'],
  'Lucknow': ['Gomti Nagar', 'Hazratganj', 'Aliganj', 'Indira Nagar', 'Mahanagar']
};

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-blue-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' }
];

export const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: 'bg-red-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-500' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-500' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-500' }
];

export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'agent', label: 'Agent' },
  { value: 'employee', label: 'Employee' }
];
