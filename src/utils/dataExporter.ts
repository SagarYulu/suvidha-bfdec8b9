
import { mockSupabase as supabase } from '@/lib/mockSupabase';

export const exportData = async (tableName: string, filters: any = {}) => {
  try {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error exporting data:', error);
    return [];
  }
};

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
