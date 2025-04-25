
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSessions as useSessionsData } from '@/hooks/useSessionsData';
import { Session } from '@/types/analytics';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Monitor sessions loading and handle errors
  useEffect(() => {
    if (error) {
      console.error("Error loading sessions:", error);
      toast({
        title: "Error loading sessions",
        description: "There was a problem loading your session data. Please try again.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  // This effect handles automatic redirection for newly created sessions
  useEffect(() => {
    // Check if we have a newly created session in sessionStorage
    const newSessionId = sessionStorage.getItem('newSessionId');
    
    if (newSessionId && location.pathname === '/analytics' && !location.search.includes(newSessionId)) {
      // Remove the stored ID
      sessionStorage.removeItem('newSessionId');
      
      // Redirect to the analytics page with the new session ID
      navigate(`/analytics?lesson=${newSessionId}`, { replace: true });
    }
  }, [location, navigate, sessions]);
  
  return (
    <SessionsContext.Provider value={{ sessions, isLoading, error, refetchSessions: refetch }}>
      {children}
    </SessionsContext.Provider>
  );
};
