
import React, { createContext, useContext, useState } from 'react';

export interface SessionData {
  id: string;
  date: string;
  understandingPercent: number;
  confusedPercent: number;
  keyMoments: number;
  name: string;
  analytics: Array<{
    timestamp: string;
    attention: number;
    understanding: number;
    transcript: string;
  }>;
  outline: Array<{
    timestamp: string;
    topic: string;
    status: string;
    transcript: string;
  }>;
  summary: string;
}

interface SessionsContextType {
  sessions: SessionData[];
  addSession: (session: SessionData) => void;
  getSession: (id: string) => SessionData | undefined;
}

const SessionsContext = createContext<SessionsContextType | undefined>(undefined);

export function SessionsProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<SessionData[]>([
    {
      id: "lesson-1",
      date: "Yesterday",
      understandingPercent: 68,
      confusedPercent: 32,
      keyMoments: 4,
      name: "Photosynthesis - April 20",
      analytics: [
        { timestamp: '00:00', attention: 90, understanding: 95, transcript: "Today we're going to learn about photosynthesis." },
        { timestamp: '02:30', attention: 85, understanding: 80, transcript: "The process requires sunlight, water, and carbon dioxide." },
        { timestamp: '05:00', attention: 60, understanding: 40, transcript: "The light reactions happen in the thylakoid membrane." }
      ],
      outline: [
        { timestamp: '00:00 - 05:00', topic: 'Introduction to Photosynthesis', status: 'attentive', transcript: "Today we're going to learn about photosynthesis." }
      ],
      summary: "Introduction to photosynthesis concepts and processes."
    },
    {
      id: "lesson-2",
      date: "May 1",
      understandingPercent: 24,
      confusedPercent: 76,
      keyMoments: 8,
      name: "Genetics - April 18",
      analytics: [
        { timestamp: '00:00', attention: 75, understanding: 70, transcript: "Let's start with basic concepts in genetics." },
        { timestamp: '03:00', attention: 60, understanding: 65, transcript: "A gene is a segment of DNA that codes for a protein." }
      ],
      outline: [
        { timestamp: '00:00 - 04:00', topic: 'Introduction to Genetics', status: 'confused', transcript: "Let's start with basic concepts in genetics." }
      ],
      summary: "Coverage of basic genetic concepts and inheritance patterns."
    }
  ]);

  const addSession = (session: SessionData) => {
    setSessions(prev => [session, ...prev]);
  };

  const getSession = (id: string) => {
    return sessions.find(session => session.id === id);
  };

  return (
    <SessionsContext.Provider value={{ sessions, addSession, getSession }}>
      {children}
    </SessionsContext.Provider>
  );
}

export function useSessions() {
  const context = useContext(SessionsContext);
  if (context === undefined) {
    throw new Error('useSessions must be used within a SessionsProvider');
  }
  return context;
}
