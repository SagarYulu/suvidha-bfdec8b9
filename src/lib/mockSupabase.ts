
// Mock Supabase client for components that still reference it
export const supabase = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        order: (column: string, options?: any) => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null })
        }),
        maybeSingle: () => Promise.resolve({ data: null, error: null })
      }),
      order: (column: string, options?: any) => Promise.resolve({ data: [], error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null })
    }),
    insert: (data: any) => Promise.resolve({ data: null, error: null }),
    update: (data: any) => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null })
  })
};
