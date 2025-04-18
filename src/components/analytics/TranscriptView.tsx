
import React from 'react';

interface TranscriptViewProps {
  transcript: string;
  defaultData: any[];
}

export const TranscriptView = ({ transcript, defaultData }: TranscriptViewProps) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-[hsl(var(--attune-purple))] mb-2">Session Transcript</h3>
      <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 p-3 shadow-inner bg-white font-mono">
        {transcript ? (
          <pre className="whitespace-pre-wrap text-sm">{transcript}</pre>
        ) : (
          defaultData.map((item, index) => (
            <div key={index} className="mb-2">
              <span className="text-sm">{item.transcript}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
