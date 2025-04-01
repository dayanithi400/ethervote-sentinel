
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Default values for development (will be overridden by actual env vars if available)
const supabaseUrl = "https://fyipqumgopcmmpqhmznp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5aXBxdW1nb3BjbW1wcWhtem5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MTEwMzgsImV4cCI6MjA1OTA4NzAzOH0.dhTrbAJ2rKng0aAoMKBc9PViVWJ3cTzT9qErFjJPyik";

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
