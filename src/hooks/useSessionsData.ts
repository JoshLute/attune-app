
import { useQuery } from '@tanstack/react-query';
import { fetchSessions, fetchSessionEvents, fetchAIInsights, fetchSessionTags } from '@/lib/api';
import { Session, SessionEvent, AIInsight } from '@/types/analytics';

export function useSessions() {
  const { data: sessions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions,
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true,
    retry: 3
  });

  return {
    sessions,
    isLoading,
    error,
    refetch
  };
}

export function useSessionDetails(sessionId: string) {
  const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['session-events', sessionId],
    queryFn: () => fetchSessionEvents(sessionId),
    enabled: !!sessionId,
    refetchOnWindowFocus: true,
    retry: 3
  });

  const { data: insights = [], isLoading: insightsLoading, refetch: refetchInsights } = useQuery({
    queryKey: ['session-insights', sessionId],
    queryFn: () => fetchAIInsights(sessionId),
    enabled: !!sessionId,
    refetchOnWindowFocus: true,
    retry: 3
  });

  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ['session-tags', sessionId],
    queryFn: () => fetchSessionTags(sessionId),
    enabled: !!sessionId,
    refetchOnWindowFocus: true,
    retry: 3
  });

  // Ensure we have valid data for each event type
  const processedEvents = events.map(event => {
    if (event.event_type === 'attention' || event.event_type === 'understanding') {
      return {
        ...event,
        value: event.value ?? (event.event_type === 'attention' ? 80 : 75)
      };
    }
    if (event.event_type === 'transcript') {
      return {
        ...event,
        content: event.content || 'No transcription available for this segment'
      };
    }
    return event;
  });

  const refetch = () => {
    refetchEvents();
    refetchInsights();
  };

  return {
    events: processedEvents,
    insights,
    tags,
    isLoading: eventsLoading || insightsLoading || tagsLoading,
    refetch
  };
}
