import React, { createContext, useContext } from 'react';
import { useSessions } from '@/hooks/useSessionsData';

interface SessionsContextType {
  sessions: any[];
  isLoading: boolean;
  error: any;
}

const SessionsContext = createContext<SessionsContextType>({
  sessions: [],
  isLoading: false,
  error: null,
});

export const useSessionsContext = () => useContext(SessionsContext);

export const SessionsProvider = ({ children }: { children: React.ReactNode }) => {
  const { sessions, isLoading, error } = useSessions();
  
  return (
    <SessionsContext.Provider value={{ sessions, isLoading, error }}>
      {children}
    </SessionsContext.Provider>
  );
};
