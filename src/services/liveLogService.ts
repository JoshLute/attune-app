
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export const addLiveLogEntry = async (entry: Omit<LiveLogEntry, 'time'>) => {
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
};
