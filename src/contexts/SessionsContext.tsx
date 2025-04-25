
import React, { createContext, useContext } from 'react';
import { useSessions as useSessionsData } from '@/hooks/useSessionsData';
import { Session } from '@/types/analytics';

interface SessionsContextType {
  sessions: Session[];
  isLoading: boolean;
  error: any;
}

const SessionsContext = createContext<SessionsContextType>({
  sessions: [],
  isLoading: false,
  error: null,
});

export const useSessionsContext = () => useContext(SessionsContext);

// Renamed to avoid confusion with the hook from useSessionsData
export const useSessions = () => useContext(SessionsContext);

export const SessionsProvider = ({ children }: { children: React.ReactNode }) => {
  const { sessions, isLoading, error } = useSessionsData();
  
  return (
    <SessionsContext.Provider value={{ sessions, isLoading, error }}>
      {children}
    </SessionsContext.Provider>
  );
};
