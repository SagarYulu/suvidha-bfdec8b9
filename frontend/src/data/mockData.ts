
export const mockUsers = [
  {
    id: 'YUL001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@yulu.bike',
    phone: '+919876543210',
    city: 'Bangalore',
    cluster: 'North',
    role: 'DE',
    employee_id: 'EMP001'
  },
  {
    id: 'YUL002', 
    name: 'Priya Sharma',
    email: 'priya.sharma@yulu.bike',
    phone: '+919876543211',
    city: 'Delhi',
    cluster: 'Central Delhi',
    role: 'FM',
    employee_id: 'EMP002'
  },
  {
    id: 'YUL003',
    name: 'Amit Singh',
    email: 'amit.singh@yulu.bike',
    phone: '+919876543212',
    city: 'Mumbai',
    cluster: 'Mumbai Central',
    role: 'AM',
    employee_id: 'EMP003'
  }
];

export const mockIssues = [
  {
    id: 'ISSUE001',
    title: 'Salary not credited',
    description: 'My salary for last month has not been credited to my account',
    status: 'open',
    priority: 'high',
    type: 'salary',
    subType: 'salary_delay',
    userId: 'YUL001',
    assignedTo: null,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'ISSUE002',
    title: 'Vehicle battery issue',
    description: 'The battery is not charging properly',
    status: 'in_progress',
    priority: 'medium',
    type: 'vehicle',
    subType: 'battery_issue',
    userId: 'YUL002',
    assignedTo: 'admin@yulu.com',
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-15T09:15:00Z'
  }
];

export const mockFeedback = [
  {
    id: 'FB001',
    userId: 'YUL001',
    rating: 4,
    comment: 'Good support team',
    sentiment: 'positive',
    tags: ['support', 'helpful'],
    createdAt: '2024-01-15T12:00:00Z'
  },
  {
    id: 'FB002',
    userId: 'YUL002',
    rating: 2,
    comment: 'App is very slow',
    sentiment: 'negative',
    tags: ['app', 'performance'],
    createdAt: '2024-01-14T16:30:00Z'
  }
];

export const mockAnalytics = {
  totalIssues: 150,
  resolvedIssues: 120,
  avgResolutionTime: 24.5,
  avgFirstResponseTime: 4.2,
  resolutionRate: 80,
  issuesByType: [
    { name: 'Salary', value: 45 },
    { name: 'Vehicle', value: 30 },
    { name: 'App Issues', value: 25 },
    { name: 'Documentation', value: 20 },
    { name: 'Other', value: 30 }
  ],
  issuesByCity: [
    { name: 'Bangalore', value: 50 },
    { name: 'Delhi', value: 40 },
    { name: 'Mumbai', value: 35 },
    { name: 'Pune', value: 25 }
  ],
  monthlyTrends: [
    { month: 'Jan', issues: 120, resolved: 100 },
    { month: 'Feb', issues: 135, resolved: 110 },
    { month: 'Mar', issues: 150, resolved: 120 }
  ]
};

export const mockSentimentData = {
  overallSentiment: {
    positive: 60,
    neutral: 25,
    negative: 15
  },
  averageRating: 3.8,
  totalFeedback: 500,
  trendData: [
    { date: '2024-01-01', rating: 3.5, sentiment: 'neutral' },
    { date: '2024-01-02', rating: 3.8, sentiment: 'positive' },
    { date: '2024-01-03', rating: 4.1, sentiment: 'positive' },
    { date: '2024-01-04', rating: 3.2, sentiment: 'neutral' },
    { date: '2024-01-05', rating: 3.9, sentiment: 'positive' }
  ],
  topicAnalysis: [
    { topic: 'Salary', count: 45, sentiment: 'negative' },
    { topic: 'Vehicle', count: 38, sentiment: 'neutral' },
    { topic: 'App', count: 32, sentiment: 'negative' },
    { topic: 'Support', count: 28, sentiment: 'positive' },
    { topic: 'Training', count: 22, sentiment: 'positive' }
  ]
};
