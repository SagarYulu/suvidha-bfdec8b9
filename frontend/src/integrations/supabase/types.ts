
// Type definitions for compatibility with existing code
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
        };
        Insert: {
          email: string;
          name: string;
        };
        Update: {
          email?: string;
          name?: string;
        };
      };
      issues: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: string;
          created_at: string;
        };
        Insert: {
          title: string;
          description: string;
          status?: string;
        };
        Update: {
          title?: string;
          description?: string;
          status?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
