
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SessionData {
  id: string;
  student_id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  summary: string | null;
}

export interface SessionEvent {
  id: string;
  session_id: string;
  timestamp: string;
  event_type: 'transcript' | 'metric' | 'behavior';
  content: {
    attention?: number;
    understanding?: number;
    transcript?: string;
  };
}

export const useSessionData = (sessionId: string) => {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      return data as SessionData;
    },
    enabled: !!sessionId
  });
};

export const useSessionEvents = (sessionId: string) => {
  return useQuery({
    queryKey: ['sessionEvents', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_events')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data as SessionEvent[];
    },
    enabled: !!sessionId
  });
};
