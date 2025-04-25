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

export async function saveSessionData(
  title: string,
  transcripts: string[], 
  attentionValues: number[], 
  understandingValues: number[]
): Promise<{ session: Session, success: boolean }> {
  try {
    // Calculate averages for the session
    const attentionAvg = attentionValues.length 
      ? attentionValues.reduce((sum, val) => sum + val, 0) / attentionValues.length 
      : 0;
    
    const understandingAvg = understandingValues.length 
      ? understandingValues.reduce((sum, val) => sum + val, 0) / understandingValues.length 
      : 0;
    
    // Create initial summary
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

    // Prepare timeline data (every 10 seconds)
    const timelineData = [];
    const interval = 10; // seconds
    let currentTime = new Date();

    for (let i = 0; i < transcripts.length; i++) {
      // Round down to nearest 10-second interval
      const timestamp = new Date(
        currentTime.getTime() - (transcripts.length - i) * interval * 1000
      );

      timelineData.push({
        session_id: session.id,
        timestamp,
        content: transcripts[i],
        attention_score: attentionValues[i] || null,
        understanding_score: understandingValues[i] || null
      });
    }

    // Insert timeline data
    if (timelineData.length > 0) {
      const { error: timelineError } = await supabase
        .from('session_timeline')
        .insert(timelineData);
      
      if (timelineError) throw timelineError;
    }

    // Add behavior tags if they exist
    if ((window as any).behaviorEvents && (window as any).behaviorEvents.length > 0) {
      const tagInserts = (window as any).behaviorEvents.map(event => ({
        session_id: session.id,
        tag_text: event.tag,
        timestamp: new Date(Date.now() - (event.timestamp * 1000)).toISOString()
      }));

      const { error: tagsError } = await supabase
        .from('session_tags')
        .insert(tagInserts);

      if (tagsError) throw tagsError;
    }
    
    // Return the created session
    return {
      session: {
        ...session,
        date: new Date(session.created_at || '').toLocaleDateString(),
        understandingPercent: session.understanding_avg || 0,
        confusedPercent: 100 - (session.understanding_avg || 0),
        keyMoments: Math.floor(Math.random() * 5) + 1,
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

// Update the useSessionDetails hook to use the new timeline data
export async function fetchSessionEvents(sessionId: string): Promise<SessionEvent[]> {
  const { data, error } = await supabase
    .rpc('get_session_timeline', { 
      p_session_id: sessionId,
      p_limit: 1000, // Adjust limit as needed
      p_offset: 0 
    });

  if (error) throw error;

  // Transform timeline data to match SessionEvent type
  return (data || []).map(event => ({
    id: event.timeline_id,
    session_id: sessionId,
    timestamp: event.event_timestamp,
    event_type: event.event_content ? 'transcript' : 'attention',
    content: event.event_content,
    value: event.event_content ? null : event.event_attention_score
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

// Add this function to fetch session tags
export async function fetchSessionTags(sessionId: string): Promise<{ id: string; tag_text: string; timestamp: string }[]> {
  const { data, error } = await supabase
    .from('session_tags')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data || [];
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
