
export const formatIssueId = (id: string): string => {
  return `#${id.slice(0, 8).toUpperCase()}`;
};

export const getIssueAge = (createdAt: string): string => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours === 0 ? 'Just now' : `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return '1 day ago';
  } else {
    return `${diffDays} days ago`;
  }
};

export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'open': 'bg-red-100 text-red-800',
    'in_progress': 'bg-yellow-100 text-yellow-800',
    'pending': 'bg-blue-100 text-blue-800',
    'resolved': 'bg-green-100 text-green-800',
    'closed': 'bg-gray-100 text-gray-800',
    'escalated': 'bg-purple-100 text-purple-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getPriorityColor = (priority: string): string => {
  const priorityColors: Record<string, string> = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800'
  };
  
  return priorityColors[priority] || 'bg-gray-100 text-gray-800';
};

export const getPriorityIcon = (priority: string): string => {
  const priorityIcons: Record<string, string> = {
    'low': '🔵',
    'medium': '🟡',
    'high': '🟠',
    'urgent': '🔴'
  };
  
  return priorityIcons[priority] || '⚪';
};

export const getTimeToResolve = (createdAt: string, resolvedAt?: string): string => {
  if (!resolvedAt) return 'Not resolved';
  
  const created = new Date(createdAt);
  const resolved = new Date(resolvedAt);
  const diffMs = resolved.getTime() - created.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    const remainingHours = diffHours % 24;
    return remainingHours > 0 ? `${diffDays}d ${remainingHours}h` : `${diffDays}d`;
  } else {
    return `${diffHours}h`;
  }
};

export const isOverdue = (createdAt: string, priority: string): boolean => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  
  const slaHours: Record<string, number> = {
    'urgent': 4,
    'high': 24,
    'medium': 72,
    'low': 168
  };
  
  const maxHours = slaHours[priority] || 72;
  return diffHours > maxHours;
};

export const calculateSLAStatus = (createdAt: string, priority: string, status: string): {
  status: 'on-time' | 'warning' | 'overdue';
  remainingTime?: string;
} => {
  if (['resolved', 'closed'].includes(status)) {
    return { status: 'on-time' };
  }
  
  const created = new Date(createdAt);
  const now = new Date();
  const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  
  const slaHours: Record<string, number> = {
    'urgent': 4,
    'high': 24,
    'medium': 72,
    'low': 168
  };
  
  const maxHours = slaHours[priority] || 72;
  const remainingHours = maxHours - diffHours;
  
  if (remainingHours <= 0) {
    return { status: 'overdue' };
  } else if (remainingHours <= maxHours * 0.2) {
    return { 
      status: 'warning',
      remainingTime: `${Math.ceil(remainingHours)}h remaining`
    };
  } else {
    return { 
      status: 'on-time',
      remainingTime: `${Math.ceil(remainingHours)}h remaining`
    };
  }
};

export const groupIssuesByStatus = (issues: any[]) => {
  return issues.reduce((groups, issue) => {
    const status = issue.status;
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(issue);
    return groups;
  }, {} as Record<string, any[]>);
};

export const sortIssuesByPriority = (issues: any[]) => {
  const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
  return issues.sort((a, b) => {
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
    return bPriority - aPriority;
  });
};
