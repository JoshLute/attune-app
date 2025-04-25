
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use the actual Supabase URL and anon key instead of environment variables
const supabaseUrl = "https://objlnvvnifkotxctblgd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamxudnZuaWZrb3R4Y3RibGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MzcyNzgsImV4cCI6MjA2MDUxMzI3OH0.9qwOU2_CPeI-DFxyW21hcMz8wljuyg5Mju6dYyKySc0";

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
