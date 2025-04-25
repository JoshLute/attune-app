
import { supabase } from '@/integrations/supabase/client';

export const createSession = async (studentId: string, title: string) => {
  const { data, error } = await supabase
    .from('sessions')
    .insert([
      { student_id: studentId, title }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const addSessionEvent = async (
  sessionId: string,
  eventType: 'transcript' | 'metric' | 'behavior',
  content: any
) => {
  const { data, error } = await supabase
    .from('session_events')
    .insert([
      {
        session_id: sessionId,
        event_type: eventType,
        content
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const addAIInsight = async (
  sessionId: string,
  type: 'summary' | 'review_point' | 'recommendation',
  content: string,
  context?: any
) => {
  const { data, error } = await supabase
    .from('ai_insights')
    .insert([
      {
        session_id: sessionId,
        type,
        content,
        context
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};
