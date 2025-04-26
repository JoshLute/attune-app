
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

export const SessionTranscript: React.FC<SessionTranscriptProps> = ({ analyticsData }) => {
  // If no analyticsData is provided or it's empty, return null
  if (!analyticsData || analyticsData.length === 0) {
    return null;
  }

  // Create dummy transcript data using the educational content
  const dummyTranscripts: AnalyticsData[] = [
    {
      ...analyticsData[0],
      transcript: "Good morning, everyone! Today, we're going to learn about how fractions and decimals are related."
    },
    {
      ...analyticsData[1],
      transcript: "Let's start by remembering what a fraction is. A fraction represents a part of a whole, like 1/2 or 3/4."
    },
    {
      ...analyticsData[2],
      transcript: "Now, decimals are another way to show parts of a whole, just written differently. For example, 1/2 is the same as 0.5."
    }
  ];

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-[hsl(var(--attune-purple))] mb-2">Session Transcript</h3>
      <div className="max-h-80 overflow-y-auto rounded-2xl bg-white/90 shadow-[0_4px_24px_0_rgba(123,104,238,0.06)] p-6">
        {dummyTranscripts.map((data, index) => (
          <div key={index} className="mb-3">
            <span className="text-[15px] text-gray-800">{data.transcript}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
