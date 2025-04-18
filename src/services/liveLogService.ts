
import { createClient } from '@supabase/supabase-js';
import { LiveLogEntry } from '@/types/liveLog';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase URL configured:', !!supabaseUrl);
console.log('Supabase Anon Key configured:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables not properly configured');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const addLiveLogEntry = async (entry: Omit<LiveLogEntry, 'time'>) => {
  try {
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
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to log entry:', error);
    throw error;
  }
};
