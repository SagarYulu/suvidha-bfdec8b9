
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Issue } from '@/types';

interface SLAMetrics {
  overallSLA: {
    breachedCount: number;
    totalCount: number;
    breachRate: number;
  };
  priorityBreakdown: Array<{
    priority: string;
    breachedCount: number;
    totalCount: number;
    breachRate: number;
  }>;
  cityBreakdown: Array<{
    city: string;
    breachedCount: number;
    totalCount: number;
    breachRate: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    breachedCount: number;
    totalCount: number;
    breachRate: number;
  }>;
  avgResolutionTime: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

interface SLAAnalyticsFilters {
  startDate?: string;
  endDate?: string;
  city?: string;
  priority?: string;
}

const getSLATarget = (priority: string): number => {
  switch (priority) {
    case 'urgent': return 4; // 4 hours (changed from 'critical')
    case 'high': return 24; // 24 hours
    case 'medium': return 48; // 48 hours
    case 'low': return 72; // 72 hours
    default: return 48;
  }
};

const isSLABreached = (issue: Issue): boolean => {
  const createdAt = new Date(issue.createdAt);
  const resolvedAt = issue.resolvedAt ? new Date(issue.resolvedAt) : new Date();
  const resolutionTimeHours = (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  const slaTarget = getSLATarget(issue.priority);
  
  return resolutionTimeHours > slaTarget;
};

const getResolutionTimeHours = (issue: Issue): number => {
  const createdAt = new Date(issue.createdAt);
  const resolvedAt = issue.resolvedAt ? new Date(issue.resolvedAt) : new Date();
  return (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
};

const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'System Login Issue',
    description: 'Cannot login to the system',
    issueType: 'technical',
    priority: 'high',
    status: 'resolved',
    employeeId: 'emp1',
    city: 'Bangalore',
    cluster: 'South',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T15:00:00Z',
    resolvedAt: '2024-01-15T15:00:00Z',
    comments: []
  },
  {
    id: '2',
    title: 'Salary Query',
    description: 'Query about salary calculation',
    issueType: 'hr',
    priority: 'medium',
    status: 'resolved',
    employeeId: 'emp2',
    city: 'Mumbai',
    cluster: 'West',
    createdAt: '2024-01-14T10:00:00Z',
    updatedAt: '2024-01-16T12:00:00Z',
    resolvedAt: '2024-01-16T12:00:00Z',
    comments: []
  },
  {
    id: '3',
    title: 'Urgent Server Issue',
    description: 'Production server is down',
    issueType: 'technical',
    priority: 'urgent',
    status: 'resolved',
    employeeId: 'emp3',
    city: 'Delhi',
    cluster: 'North',
    createdAt: '2024-01-13T14:00:00Z',
    updatedAt: '2024-01-13T16:00:00Z',
    resolvedAt: '2024-01-13T16:00:00Z',
    comments: []
  }
];

export const useSLAAnalytics = (filters?: SLAAnalyticsFilters) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const { data: issues = mockIssues, isLoading } = useQuery({
    queryKey: ['sla-issues', filters, selectedPeriod],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockIssues;
    },
  });

  const calculateSLAMetrics = useCallback((issues: Issue[]): SLAMetrics => {
    const totalCount = issues.length;
    const breachedIssues = issues.filter(isSLABreached);
    const breachedCount = breachedIssues.length;
    const breachRate = totalCount > 0 ? (breachedCount / totalCount) * 100 : 0;

    // Priority breakdown
    const priorityMap = new Map<string, { breached: number; total: number }>();
    issues.forEach(issue => {
      const priority = issue.priority;
      if (!priorityMap.has(priority)) {
        priorityMap.set(priority, { breached: 0, total: 0 });
      }
      const stats = priorityMap.get(priority)!;
      stats.total++;
      if (isSLABreached(issue)) {
        stats.breached++;
      }
    });

    const priorityBreakdown = Array.from(priorityMap.entries()).map(([priority, stats]) => ({
      priority,
      breachedCount: stats.breached,
      totalCount: stats.total,
      breachRate: stats.total > 0 ? (stats.breached / stats.total) * 100 : 0,
    }));

    // City breakdown
    const cityMap = new Map<string, { breached: number; total: number }>();
    issues.forEach(issue => {
      const city = issue.city || 'Unknown';
      if (!cityMap.has(city)) {
        cityMap.set(city, { breached: 0, total: 0 });
      }
      const stats = cityMap.get(city)!;
      stats.total++;
      if (isSLABreached(issue)) {
        stats.breached++;
      }
    });

    const cityBreakdown = Array.from(cityMap.entries()).map(([city, stats]) => ({
      city,
      breachedCount: stats.breached,
      totalCount: stats.total,
      breachRate: stats.total > 0 ? (stats.breached / stats.total) * 100 : 0,
    }));

    // Monthly trend (mock data for now)
    const monthlyTrend = [
      { month: 'Jan', breachedCount: 5, totalCount: 20, breachRate: 25 },
      { month: 'Feb', breachedCount: 8, totalCount: 25, breachRate: 32 },
      { month: 'Mar', breachedCount: 3, totalCount: 18, breachRate: 16.7 },
    ];

    // Average resolution time by priority
    const resolutionTimes = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    ['low', 'medium', 'high', 'urgent'].forEach(priority => {
      const priorityIssues = issues.filter(issue => issue.priority === priority);
      if (priorityIssues.length > 0) {
        const avgTime = priorityIssues.reduce((sum, issue) => 
          sum + getResolutionTimeHours(issue), 0) / priorityIssues.length;
        resolutionTimes[priority as keyof typeof resolutionTimes] = avgTime;
      }
    });

    return {
      overallSLA: {
        breachedCount,
        totalCount,
        breachRate,
      },
      priorityBreakdown,
      cityBreakdown,
      monthlyTrend,
      avgResolutionTime: resolutionTimes,
    };
  }, []);

  const metrics = calculateSLAMetrics(issues);

  const updateFilters = useCallback((newFilters: Partial<SLAAnalyticsFilters>) => {
    // Filter logic would be implemented here
  }, []);

  const updatePeriod = useCallback((period: '7d' | '30d' | '90d') => {
    setSelectedPeriod(period);
  }, []);

  return {
    metrics,
    isLoading,
    filters: filters || {},
    selectedPeriod,
    updateFilters,
    updatePeriod,
  };
};
