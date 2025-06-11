
export const hasData = (data: any[]): boolean => {
  return Array.isArray(data) && data.length > 0;
};

export const formatChartData = (data: any[], xKey: string, yKey: string) => {
  return data.map(item => ({
    name: item[xKey],
    value: item[yKey]
  }));
};

export const getChartColors = () => ({
  primary: '#2563eb',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  warning: '#f97316',
  info: '#06b6d4',
  success: '#22c55e',
  muted: '#6b7280'
});

export const formatTooltipValue = (value: any, name: string) => {
  if (typeof value === 'number') {
    return [value.toLocaleString(), name];
  }
  return [value, name];
};

export const formatXAxisTick = (value: any) => {
  if (typeof value === 'string' && value.length > 10) {
    return value.substring(0, 10) + '...';
  }
  return value;
};

export const calculatePercentage = (value: number, total: number): number => {
  return total > 0 ? (value / total) * 100 : 0;
};

export const generateRandomColor = (): string => {
  const colors = [
    '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#f97316',
    '#06b6d4', '#22c55e', '#6b7280', '#8b5cf6', '#ec4899'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
