
// This file maintains compatibility with existing imports but uses MySQL API client
import { ApiClient } from '@/services/apiClient';

// Mock Supabase client for compatibility
export const supabase = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ApiClient.get(`/api/${table}?${column}=${value}`),
      data: null,
      error: null
    }),
    insert: (data: any) => ApiClient.post(`/api/${table}`, data),
    update: (data: any) => ({
      eq: (column: string, value: any) => ApiClient.put(`/api/${table}/${value}`, data)
    }),
    delete: () => ({
      eq: (column: string, value: any) => ApiClient.delete(`/api/${table}/${value}`)
    })
  }),
  auth: {
    signInWithPassword: (credentials: any) => ApiClient.post('/api/auth/login', credentials),
    signUp: (data: any) => ApiClient.post('/api/auth/register', data),
    signOut: () => ApiClient.post('/api/auth/logout'),
    getUser: () => ApiClient.get('/api/auth/me')
  }
};

export default supabase;
