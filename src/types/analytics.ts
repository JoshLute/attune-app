
export interface Session {
  id: string;
  title: string;
  created_at: string;
  summary: string | null;
  attention_avg: number | null;
  understanding_avg: number | null;
  // Additional fields needed for the home page
  date?: string;
  understandingPercent?: number;
  confusedPercent?: number;
  keyMoments?: number;
}

export interface SessionEvent {
  id: string;
  session_id: string;
  timestamp: string;
  event_type: 'transcript' | 'attention' | 'understanding';
  value: number | null;
  content: string | null;
}

export interface AIInsight {
  id: string;
  session_id: string;
  type: 'summary' | 'review_point' | 'suggestion';
  content: string;
  created_at: string;
  metadata: any; // Change from Record<string, any> to any to match Json type
}
