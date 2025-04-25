
import { useQuery } from '@tanstack/react-query';
import { fetchSessions, fetchSessionEvents, fetchAIInsights } from '@/lib/api';
import { Session, SessionEvent, AIInsight } from '@/types/analytics';

export function useSessions() {
  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions
  });

  return {
    sessions,
    isLoading,
    error
  };
}

export function useSessionDetails(sessionId: string) {
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['session-events', sessionId],
    queryFn: () => fetchSessionEvents(sessionId),
    enabled: !!sessionId
  });

  const { data: insights = [], isLoading: insightsLoading } = useQuery({
    queryKey: ['session-insights', sessionId],
    queryFn: () => fetchAIInsights(sessionId),
    enabled: !!sessionId
  });

  return {
    events,
    insights,
    isLoading: eventsLoading || insightsLoading
  };
}
