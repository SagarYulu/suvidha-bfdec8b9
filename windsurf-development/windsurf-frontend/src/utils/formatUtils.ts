
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
};

export const formatDateTime = (date: string | Date): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy HH:mm');
};

export const formatTimeAgo = (date: string | Date): string => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const formatPriority = (priority: string): string => {
  const priorityMap: { [key: string]: string } = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical'
  };
  return priorityMap[priority] || priority;
};

export const formatStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed'
  };
  return statusMap[status] || status;
};

export const getPriorityColor = (priority: string): string => {
  const colorMap: { [key: string]: string } = {
    low: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-orange-600 bg-orange-100',
    critical: 'text-red-600 bg-red-100'
  };
  return colorMap[priority] || 'text-gray-600 bg-gray-100';
};

export const getStatusColor = (status: string): string => {
  const colorMap: { [key: string]: string } = {
    open: 'text-blue-600 bg-blue-100',
    in_progress: 'text-yellow-600 bg-yellow-100',
    resolved: 'text-green-600 bg-green-100',
    closed: 'text-gray-600 bg-gray-100'
  };
  return colorMap[status] || 'text-gray-600 bg-gray-100';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};
