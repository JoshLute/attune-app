
import { createClient } from '@supabase/supabase-js';
import { LiveLogEntry } from '@/types/liveLog';
import { toast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

export const addLiveLogEntry = async (entry: Omit<LiveLogEntry, 'time'>) => {
  try {
    console.log('Attempting to add live log entry to Supabase');
    
    // Format time as HH:MM:SS without timezone info to match time column type
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    
    const { data, error } = await supabase
      .from('live log') // Use correct table name with space
      .insert([
        {
          time: timeStr, // Format as HH:MM:SS to match time type
          confusion: entry.confusion_level, // Match database column names
          inattention: 100 - entry.attention_level, // Convert attention to inattention
          transcription: entry.transcription_text || '' // Match database column name
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
