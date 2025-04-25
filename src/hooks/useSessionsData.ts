
import { useQuery } from '@tanstack/react-query';
import { fetchSessions, fetchSessionEvents, fetchAIInsights } from '@/lib/api';
import { Session, SessionEvent, AIInsight } from '@/types/analytics';

export function useSessions() {
  const { data: sessions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions
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
    enabled: !!sessionId
  });

  const { data: insights = [], isLoading: insightsLoading, refetch: refetchInsights } = useQuery({
    queryKey: ['session-insights', sessionId],
    queryFn: () => fetchAIInsights(sessionId),
    enabled: !!sessionId
  });

  const refetch = () => {
    refetchEvents();
    refetchInsights();
  };

  return {
    events,
    insights,
    isLoading: eventsLoading || insightsLoading,
    refetch
  };
}
