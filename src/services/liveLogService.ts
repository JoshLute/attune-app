
import { createClient } from '@supabase/supabase-js';
import { LiveLogEntry } from '@/types/liveLog';
import { toast } from '@/hooks/use-toast';

// Initialize with default empty values
let supabaseUrl = '';
let supabaseKey = '';

// Try to get environment variables with safeguards
try {
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  console.log('Environment variables loaded:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
  console.log('VITE_SUPABASE_URL value:', supabaseUrl || 'not set');
  console.log('VITE_SUPABASE_ANON_KEY configured:', !!supabaseKey);
} catch (error) {
  console.error('Error accessing environment variables:', error);
}

// Initialize supabase client with additional safeguards
let supabase = null;

try {
  // Only create client if we have valid values
  if (supabaseUrl && supabaseUrl.trim() !== '' && 
      supabaseKey && supabaseKey.trim() !== '') {
    console.log('Creating Supabase client with URL:', supabaseUrl);
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully');
  } else {
    console.error('Supabase initialization failed: Missing required configuration');
    console.error('URL defined:', !!supabaseUrl);
    console.error('Key defined:', !!supabaseKey);
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error.message);
}

export const addLiveLogEntry = async (entry: Omit<LiveLogEntry, 'time'>) => {
  try {
    // Check if supabase was initialized properly
    if (!supabase) {
      const errorMsg = 'Supabase client not initialized. Check your environment variables.';
      console.error(errorMsg);
      toast({
        title: "Database Error",
        description: errorMsg,
        variant: "destructive"
      });
      return null;
    }

    console.log('Attempting to add live log entry to Supabase');
    const { data, error } = await supabase
      .from('live_log')
      .insert([
        {
          time: new Date().toISOString(),
          confusion_level: entry.confusion_level,
          attention_level: entry.attention_level,
          transcription_text: entry.transcription_text,
        },
      ]);

    if (error) {
      console.error('Error logging live data:', error);
      toast({
        title: "Data Logging Error",
        description: `Failed to save data: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }

    console.log('Successfully added live log entry');
    return data;
  } catch (error) {
    console.error('Failed to log entry:', error);
    throw error;
  }
};
