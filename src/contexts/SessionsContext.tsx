import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSessions as useSessionsData } from '@/hooks/useSessionsData';
import { Session } from '@/types/analytics';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";

interface SessionsContextType {
  sessions: Session[];
  isLoading: boolean;
  error: any;
  refetchSessions: () => void;
}

const SessionsContext = createContext<SessionsContextType>({
  sessions: [],
  isLoading: false,
  error: null,
  refetchSessions: () => {}
});

export const useSessionsContext = () => useContext(SessionsContext);

// Renamed to avoid confusion with the hook from useSessionsData
export const useSessions = () => useContext(SessionsContext);

export const SessionsProvider = ({ children }: { children: React.ReactNode }) => {
  const { sessions, isLoading, error, refetch } = useSessionsData();
  const location = useLocation();
  const navigate = useNavigate();

  // Monitor sessions loading and handle errors
  useEffect(() => {
    if (error) {
      console.error("Error loading sessions:", error);
      toast.error(
        "There was a problem loading your session data. Please try again."
      );
    }
  }, [error]);

  // This effect handles automatic redirection for newly created sessions
  useEffect(() => {
    const newSessionId = sessionStorage.getItem('newSessionId');
    
    if (newSessionId && location.pathname === '/analytics' && !location.search.includes(newSessionId)) {
      console.log('Redirecting to new session:', newSessionId);
      sessionStorage.removeItem('newSessionId');
      navigate(`/analytics?lesson=${newSessionId}`, { replace: true });
    }
  }, [location, navigate, sessions]);
  
  return (
    <SessionsContext.Provider value={{ sessions, isLoading, error, refetchSessions: refetch }}>
      {children}
    </SessionsContext.Provider>
  );
};
