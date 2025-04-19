
import { createClient } from '@supabase/supabase-js';
import { LiveLogEntry } from '@/types/liveLog';
import { toast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

export const addLiveLogEntry = async (entry: Omit<LiveLogEntry, 'time'>) => {
  try {
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
