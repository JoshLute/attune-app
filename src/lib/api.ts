
import { supabase } from '@/integrations/supabase/client';
import type { Session, SessionEvent, AIInsight } from '@/types/analytics';

export async function fetchSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchSessionEvents(sessionId: string): Promise<SessionEvent[]> {
  const { data, error } = await supabase
    .from('session_events')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true });

  if (error) throw error;
  // Cast the event_type to the correct type
  return (data || []).map(event => ({
    ...event,
    event_type: event.event_type as 'transcript' | 'attention' | 'understanding'
  }));
}

export async function fetchAIInsights(sessionId: string, type?: string): Promise<AIInsight[]> {
  let query = supabase
    .from('ai_insights')
    .select('*')
    .eq('session_id', sessionId);
    
  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query.order('created_at', { ascending: true });

  if (error) throw error;
  // Cast the type to the correct type
  return (data || []).map(insight => ({
    ...insight,
    type: insight.type as 'summary' | 'review_point' | 'suggestion'
  }));
}
