
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Default values for development (will be overridden by actual env vars if available)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yourprojectid.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Check if we have the required environment variables
if (!supabaseUrl || supabaseUrl === 'https://yourprojectid.supabase.co') {
  console.warn('Missing or default VITE_SUPABASE_URL. Please set your Supabase URL in the environment variables.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  console.warn('Missing or default VITE_SUPABASE_ANON_KEY. Please set your Supabase Anon Key in the environment variables.');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
