
// Mock Supabase client for components that still reference it
export const mockSupabase = {
  from: (table: string) => ({
    select: (columns?: string) => {
      const mockResponse = { data: [], error: null };
      return {
        eq: (column: string, value: any) => ({
          order: (column: string, options?: any) => ({
            maybeSingle: () => Promise.resolve(mockResponse)
          }),
          maybeSingle: () => Promise.resolve(mockResponse)
        }),
        order: (column: string, options?: any) => Promise.resolve(mockResponse),
        maybeSingle: () => Promise.resolve(mockResponse)
      };
    },
    insert: (data: any) => Promise.resolve({ data: null, error: null }),
    update: (data: any) => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null })
  })
};

// Export as default for easier importing
export default mockSupabase;

// Also export as supabase for direct replacement
export const supabase = mockSupabase;
