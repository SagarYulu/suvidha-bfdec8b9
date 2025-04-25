
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tnesowutsnxrhqrashok.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZXNvd3V0c254cmhxcmFzaG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NzQyNTEsImV4cCI6MjA2MTE1MDI1MX0.F7FVti5RTVlzEhXq57R4CiKsA6qqoybS4HvLynQx4ww";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: localStorage
    }
  }
);
