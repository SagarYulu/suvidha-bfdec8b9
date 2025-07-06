
export const ROLE_OPTIONS = [
  'DE',
  'FM', 
  'AM',
  'City Head',
  'Revenue and Ops Head',
  'CRM',
  'Cluster Head',
  'Payroll Ops',
  'HR Admin',
  'Super Admin'
];

export const CITY_OPTIONS = [
  'Bangalore',
  'Delhi',
  'Mumbai',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad'
];

export const CLUSTER_OPTIONS: Record<string, string[]> = {
  'Bangalore': ['North', 'South', 'East', 'West', 'Central'],
  'Delhi': ['North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'],
  'Mumbai': ['Mumbai Central', 'Mumbai North', 'Mumbai South', 'Navi Mumbai', 'Thane'],
  'Pune': ['Pune East', 'Pune West', 'Pune North', 'Pune South', 'PCMC'],
  'Hyderabad': ['Hyderabad Central', 'Hyderabad North', 'Hyderabad South', 'Secunderabad'],
  'Chennai': ['Chennai North', 'Chennai South', 'Chennai East', 'Chennai West'],
  'Kolkata': ['Kolkata North', 'Kolkata South', 'Kolkata East', 'Kolkata West'],
  'Ahmedabad': ['Ahmedabad East', 'Ahmedabad West', 'Ahmedabad North', 'Ahmedabad South']
};

export const STATUS_OPTIONS = [
  'open',
  'in_progress',
  'pending',
  'resolved',
  'closed',
  'escalated'
];

export const PRIORITY_OPTIONS = [
  'low',
  'medium',
  'high',
  'urgent'
];

export const ISSUE_CATEGORIES = [
  'operational',
  'technical', 
  'administrative',
  'financial'
];

export const ESCALATION_LEVELS = [
  'level_1',
  'level_2',
  'level_3',
  'management'
];

export const FEEDBACK_TYPES = [
  'positive',
  'neutral',
  'negative'
];

export const SENTIMENT_CATEGORIES = [
  'very_positive',
  'positive',
  'neutral',
  'negative',
  'very_negative'
];

// Helper functions
export const getClustersForCity = (city: string): string[] => {
  return CLUSTER_OPTIONS[city] || [];
};

export const isValidRole = (role: string): boolean => {
  return ROLE_OPTIONS.includes(role);
};

export const isValidCity = (city: string): boolean => {
  return CITY_OPTIONS.includes(city);
};

export const isValidCluster = (city: string, cluster: string): boolean => {
  const clusters = getClustersForCity(city);
  return clusters.includes(cluster);
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'open': 'Open',
    'in_progress': 'In Progress',
    'pending': 'Pending',
    'resolved': 'Resolved',
    'closed': 'Closed',
    'escalated': 'Escalated'
  };
  return labels[status] || status;
};

export const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'urgent': 'Urgent'
  };
  return labels[priority] || priority;
};
