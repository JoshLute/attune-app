
import React from 'react';

interface AnalyticsData {
  timestamp: string;
  attention: number;
  understanding: number;
  transcript: string;
}

interface SessionTranscriptProps {
  analyticsData: AnalyticsData[];
}

export const SessionTranscript: React.FC<SessionTranscriptProps> = ({ analyticsData = [] }) => {
  if (!analyticsData.length) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-medium text-[hsl(var(--attune-purple))] mb-2">Session Transcript</h3>
        <div className="rounded-2xl bg-white/90 shadow-[0_4px_24px_0_rgba(123,104,238,0.06)] p-6 text-gray-500 italic">
          No transcript data available for this session.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-[hsl(var(--attune-purple))] mb-2">Session Transcript</h3>
      <div className="max-h-80 overflow-y-auto rounded-2xl bg-white/90 shadow-[0_4px_24px_0_rgba(123,104,238,0.06)] p-6">
        {analyticsData.map((item, index) => (
          <div key={index} className="mb-3">
            <span className="text-[15px] text-gray-800">{item.transcript}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
