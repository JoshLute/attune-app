
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LessonSwitcher } from '@/components/analytics/LessonSwitcher';
import { LessonSummary } from '@/components/analytics/LessonSummary';
import { PartsToReviewSection } from '@/components/analytics/PartsToReviewSection';
import { NotesSection } from '@/components/analytics/NotesSection';
import { useSessionEvents } from '@/hooks/useSessionData';

interface AnalyticsData {
  timestamp: string;
  attention: number;
  understanding: number;
  transcript: string;
}

export default function AnalyticsPage() {
  const { studentId } = useParams();
  const [selectedSession, setSelectedSession] = useState<string>('1');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { data: sessionEvents, isLoading: eventsLoading } = useSessionEvents(selectedSession);

  useEffect(() => {
    if (sessionEvents) {
      const formattedData: AnalyticsData[] = sessionEvents.map(event => ({
        timestamp: event.timestamp,
        attention: event.content.attention || 0,
        understanding: event.content.understanding || 0,
        transcript: event.content.transcript || ''
      }));
      setAnalyticsData(formattedData);
      setIsLoading(false);
    }
  }, [sessionEvents]);

  // Calculate averages using proper reduce initialization
  const averageAttention = analyticsData.length > 0
    ? analyticsData.reduce((sum, current) => sum + current.attention, 0) / analyticsData.length
    : 0;

  const averageUnderstanding = analyticsData.length > 0
    ? analyticsData.reduce((sum, current) => sum + current.understanding, 0) / analyticsData.length
    : 0;

  const summary = analyticsData.length > 0
    ? analyticsData[analyticsData.length - 1].transcript
    : '';

  if (isLoading || eventsLoading) {
    return <div className="p-6">Loading analytics data...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <LessonSwitcher
          value={selectedSession}
          onChange={(value) => setSelectedSession(value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <LessonSummary
          understanding={averageUnderstanding}
          attention={averageAttention}
          summary={summary}
        />
        <NotesSection />
      </div>

      <div className="mt-8">
        <PartsToReviewSection
          analytics={analyticsData}
          attentionThreshold={60}
          understandingThreshold={60}
        />
      </div>
    </div>
  );
}
