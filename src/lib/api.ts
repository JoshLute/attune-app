
import { supabase } from '@/integrations/supabase/client';
import type { Session, SessionEvent, AIInsight } from '@/types/analytics';
import { Json } from '@/integrations/supabase/types';

export async function fetchSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Transform the data to include the fields needed for the home page
  return (data || []).map(session => ({
    ...session,
    date: new Date(session.created_at || '').toLocaleDateString(),
    understandingPercent: session.understanding_avg || 0,
    confusedPercent: 100 - (session.understanding_avg || 0),
    keyMoments: 0, // Will be calculated based on significant changes in metrics
  }));
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
  
  // Transform the data to match our AIInsight type
  return (data || []).map(insight => ({
    id: insight.id,
    session_id: insight.session_id || '',
    type: insight.type as 'summary' | 'review_point' | 'suggestion',
    content: insight.content,
    created_at: insight.created_at || '',
    metadata: insight.metadata,
  }));
}

// New function to save session data when recording ends
export async function saveSessionData(
  title: string,
  transcripts: string[], 
  attentionValues: number[], 
  understandingValues: number[]
): Promise<{ session: Session, success: boolean }> {
  try {
    // Calculate averages
    const attentionAvg = attentionValues.length 
      ? attentionValues.reduce((sum, val) => sum + val, 0) / attentionValues.length 
      : 0;
    
    const understandingAvg = understandingValues.length 
      ? understandingValues.reduce((sum, val) => sum + val, 0) / understandingValues.length 
      : 0;
    
    // Create basic summary (will be enhanced by AI later)
    const initialSummary = `Session recording of "${title}" with average attention ${attentionAvg.toFixed(1)}% and understanding ${understandingAvg.toFixed(1)}%.`;
    
    // Insert new session
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert([
        { 
          title,
          attention_avg: attentionAvg,
          understanding_avg: understandingAvg,
          summary: initialSummary
        }
      ])
      .select()
      .single();
    
    if (sessionError) throw sessionError;
    
    const session = sessionData as Session;
    
    // Insert session events for each transcript and metric
    const eventInserts = [];
    
    // Insert transcript events
    for (let i = 0; i < transcripts.length; i++) {
      const timestamp = new Date(Date.now() - (transcripts.length - i) * 3000).toISOString();
      eventInserts.push({
        session_id: session.id,
        event_type: 'transcript',
        content: transcripts[i],
        timestamp,
        value: null
      });
    }
    
    // Insert attention events
    for (let i = 0; i < attentionValues.length; i++) {
      const timestamp = new Date(Date.now() - (attentionValues.length - i) * 4000).toISOString();
      eventInserts.push({
        session_id: session.id,
        event_type: 'attention',
        content: null,
        timestamp,
        value: attentionValues[i]
      });
    }
    
    // Insert understanding events
    for (let i = 0; i < understandingValues.length; i++) {
      const timestamp = new Date(Date.now() - (understandingValues.length - i) * 5000).toISOString();
      eventInserts.push({
        session_id: session.id,
        event_type: 'understanding',
        content: null,
        timestamp,
        value: understandingValues[i]
      });
    }
    
    if (eventInserts.length > 0) {
      const { error: eventsError } = await supabase
        .from('session_events')
        .insert(eventInserts);
      
      if (eventsError) throw eventsError;
    }
    
    // Return the created session
    return {
      session: {
        ...session,
        date: new Date(session.created_at || '').toLocaleDateString(),
        understandingPercent: session.understanding_avg || 0,
        confusedPercent: 100 - (session.understanding_avg || 0),
        keyMoments: Math.floor(Math.random() * 5) + 1, // Calculate key moments (for now using a placeholder)
      },
      success: true
    };
  } catch (error) {
    console.error('Error saving session data:', error);
    return {
      session: {} as Session,
      success: false
    };
  }
}

// Function to generate AI insights for a session
export async function generateSessionInsights(sessionId: string): Promise<boolean> {
  try {
    // First check if we already have insights for this session
    const { data: existingInsights } = await supabase
      .from('ai_insights')
      .select('id')
      .eq('session_id', sessionId)
      .eq('type', 'summary');
    
    // If we already have insights, don't regenerate
    if (existingInsights && existingInsights.length > 0) {
      return true;
    }
    
    // Create a summary insight (simplified version for now)
    const { data: session } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();
    
    if (!session) return false;
    
    const { data: events } = await supabase
      .from('session_events')
      .select('*')
      .eq('session_id', sessionId)
      .eq('event_type', 'transcript');
    
    if (!events || events.length === 0) return false;
    
    // Generate a sample summary (this would be replaced by AI-generated content)
    const transcripts = events.map(event => event.content).filter(Boolean).join(' ');
    const summaryContent = `This session covered various topics with ${events.length} interactions recorded. The overall understanding was ${session.understanding_avg?.toFixed(1)}%.`;
    
    // Insert the summary insight
    await supabase
      .from('ai_insights')
      .insert([
        {
          session_id: sessionId,
          type: 'summary',
          content: summaryContent,
          metadata: { 
            transcript_count: events.length,
            generated_at: new Date().toISOString() 
          }
        }
      ]);
    
    // Find points to review (low understanding moments)
    const { data: lowUnderstandingEvents } = await supabase
      .from('session_events')
      .select('*')
      .eq('session_id', sessionId)
      .eq('event_type', 'understanding')
      .lt('value', 50);
    
    if (lowUnderstandingEvents && lowUnderstandingEvents.length > 0) {
      // For each low understanding moment, create a review point
      for (const event of lowUnderstandingEvents.slice(0, 3)) {
        // Find transcript near this timestamp
        const { data: nearbyTranscript } = await supabase
          .from('session_events')
          .select('*')
          .eq('session_id', sessionId)
          .eq('event_type', 'transcript')
          .order('timestamp', { ascending: false });
        
        if (nearbyTranscript && nearbyTranscript.length > 0) {
          // Create a review point
          await supabase
            .from('ai_insights')
            .insert([
              {
                session_id: sessionId,
                type: 'review_point',
                content: `Low understanding detected (${event.value}%). Consider reviewing: "${nearbyTranscript[0].content}"`,
                metadata: {
                  understanding: event.value,
                  timestamp: event.timestamp
                }
              }
            ]);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error generating insights:', error);
    return false;
  }
}
