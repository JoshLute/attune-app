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
  
  // Process data to ensure consistent formats and types
  return (data || []).map(event => {
    let processedEvent = {
      ...event,
      event_type: event.event_type as 'transcript' | 'attention' | 'understanding'
    };
    
    // Ensure proper values for each event type
    if (processedEvent.event_type === 'attention' || processedEvent.event_type === 'understanding') {
      processedEvent.value = processedEvent.value ?? (processedEvent.event_type === 'attention' ? 80 : 75);
    }
    
    if (processedEvent.event_type === 'transcript') {
      processedEvent.content = processedEvent.content || 'No transcription available for this segment';
    }
    
    return processedEvent;
  });
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

// Update the saveSessionData function to handle the simplified recording process
export async function saveSessionData(
  title: string,
  transcripts: string[], 
  attentionValues: number[] = [], 
  understandingValues: number[] = []
): Promise<{ session: Session, success: boolean }> {
  try {
    // Insert new session first
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert([{ title }])
      .select()
      .single();
    
    if (sessionError) throw sessionError;
    
    const session = sessionData as Session;
    
    // Generate timestamps for events
    const now = new Date();
    const eventInserts = [];
    
    // Insert transcript events
    for (let i = 0; i < transcripts.length; i++) {
      const timestamp = new Date(now.getTime() - (transcripts.length - i) * 3000).toISOString();
      eventInserts.push({
        session_id: session.id,
        event_type: 'transcript',
        content: transcripts[i] || 'No transcription available for this segment',
        timestamp,
        value: null
      });
    }
    
    // Generate default attention and understanding events if none provided
    if (attentionValues.length === 0) {
      const defaultAttentionValues = [80, 82, 78, 85, 80];
      for (let i = 0; i < defaultAttentionValues.length; i++) {
        const timestamp = new Date(now.getTime() - (defaultAttentionValues.length - i) * 4000).toISOString();
        eventInserts.push({
          session_id: session.id,
          event_type: 'attention',
          content: null,
          timestamp,
          value: defaultAttentionValues[i]
        });
      }
    } else {
      // Use provided attention values
      for (let i = 0; i < attentionValues.length; i++) {
        const timestamp = new Date(now.getTime() - (attentionValues.length - i) * 4000).toISOString();
        eventInserts.push({
          session_id: session.id,
          event_type: 'attention',
          content: null,
          timestamp,
          value: attentionValues[i]
        });
      }
    }
    
    // Generate default understanding events if none provided
    if (understandingValues.length === 0) {
      const defaultUnderstandingValues = [75, 70, 80, 75, 78];
      for (let i = 0; i < defaultUnderstandingValues.length; i++) {
        const timestamp = new Date(now.getTime() - (defaultUnderstandingValues.length - i) * 5000).toISOString();
        eventInserts.push({
          session_id: session.id,
          event_type: 'understanding',
          content: null,
          timestamp,
          value: defaultUnderstandingValues[i]
        });
      }
    } else {
      // Use provided understanding values
      for (let i = 0; i < understandingValues.length; i++) {
        const timestamp = new Date(now.getTime() - (understandingValues.length - i) * 5000).toISOString();
        eventInserts.push({
          session_id: session.id,
          event_type: 'understanding',
          content: null,
          timestamp,
          value: understandingValues[i]
        });
      }
    }
    
    // Insert all events
    if (eventInserts.length > 0) {
      const { error: eventsError } = await supabase
        .from('session_events')
        .insert(eventInserts);
      
      if (eventsError) throw eventsError;
    }

    // Add behavior tags to the database
    if ((window as any).behaviorEvents && (window as any).behaviorEvents.length > 0) {
      const tagInserts = (window as any).behaviorEvents.map((event: any) => ({
        session_id: session.id,
        tag_text: event.tag,
        timestamp: new Date(now.getTime() - (event.timestamp * 1000)).toISOString()
      }));

      const { error: tagsError } = await supabase
        .from('session_tags')
        .insert(tagInserts);

      if (tagsError) throw tagsError;
    }
    
    // The session will be updated by the database trigger with averages
    // Wait a moment for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Fetch the updated session with the calculated averages
    const { data: updatedSession, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', session.id)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Return the created session with additional fields
    return {
      session: {
        ...updatedSession,
        date: new Date(updatedSession.created_at || '').toLocaleDateString(),
        understandingPercent: updatedSession.understanding_avg || 75,
        confusedPercent: 100 - (updatedSession.understanding_avg || 75),
        keyMoments: Math.min(eventInserts.filter(e => e.event_type === 'transcript').length, 5),
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
