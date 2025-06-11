
export const formOptions = {
  cities: [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur',
    'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad',
    'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik'
  ],
  
  clusters: [
    'North', 'South', 'East', 'West', 'Central', 'Northeast',
    'Northwest', 'Southeast', 'Southwest', 'Metro-1', 'Metro-2', 'Metro-3'
  ],
  
  departments: [
    'Operations', 'Maintenance', 'Customer Service', 'Sales',
    'Marketing', 'Finance', 'HR', 'IT', 'Legal', 'Procurement'
  ],
  
  roles: [
    { value: 'user', label: 'User' },
    { value: 'agent', label: 'Agent' },
    { value: 'admin', label: 'Administrator' }
  ],
  
  priorities: [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'critical', label: 'Critical', color: 'red' }
  ],
  
  statuses: [
    { value: 'open', label: 'Open', color: 'red' },
    { value: 'in_progress', label: 'In Progress', color: 'yellow' },
    { value: 'resolved', label: 'Resolved', color: 'green' },
    { value: 'closed', label: 'Closed', color: 'gray' }
  ]
};
