
import React from 'react';
import { Card } from '@/components/ui/card';

interface AnalyticsData {
  timestamp: string;
  attention: number;
  understanding: number;
  transcript: string;
}

interface SessionTranscriptProps {
  analyticsData: AnalyticsData[];
  isLoading?: boolean;
}

export const SessionTranscript: React.FC<SessionTranscriptProps> = ({ 
  analyticsData = [], 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-[hsl(var(--attune-purple))] mb-2">Session Transcript</h3>
        <div className="rounded-2xl bg-white/90 shadow-[0_4px_24px_0_rgba(123,104,238,0.06)] p-6 text-gray-500">
          <div className="flex items-center justify-center py-4">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData.length) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-[hsl(var(--attune-purple))] mb-2">Session Transcript</h3>
        <Card className="rounded-2xl bg-white/90 shadow-[0_4px_24px_0_rgba(123,104,238,0.06)] p-6">
          <div className="text-center py-8">
            <p className="text-gray-500 italic">No transcript data available for this session.</p>
            <p className="text-sm text-gray-400 mt-2">Try recording a new session with audio enabled.</p>
          </div>
        </Card>
      </div>
    );
  }

  // Filter out empty transcripts
  const validTranscripts = analyticsData.filter(item => item.transcript?.trim().length > 0);

  if (validTranscripts.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-[hsl(var(--attune-purple))] mb-2">Session Transcript</h3>
        <Card className="rounded-2xl bg-white/90 shadow-[0_4px_24px_0_rgba(123,104,238,0.06)] p-6">
          <div className="text-center py-8">
            <p className="text-gray-500 italic">No speech detected in this session.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-[hsl(var(--attune-purple))] mb-2">Session Transcript</h3>
      <div className="max-h-80 overflow-y-auto rounded-2xl bg-white/90 shadow-[0_4px_24px_0_rgba(123,104,238,0.06)] p-6">
        {validTranscripts.map((item, index) => (
          <div key={index} className="mb-3">
            <div className="flex items-start">
              <span className="text-xs text-gray-400 mr-2 mt-1 whitespace-nowrap">{item.timestamp}</span>
              <span className="text-[15px] text-gray-800">{item.transcript}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
