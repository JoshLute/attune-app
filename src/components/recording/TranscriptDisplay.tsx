
import React from 'react';
import { LiveTranscription } from "./LiveTranscription";

interface TranscriptDisplayProps {
  transcript: string[];
  isRecording: boolean;
  onTranscriptUpdate: (text: string) => void;
}

export function TranscriptDisplay({ transcript, isRecording, onTranscriptUpdate }: TranscriptDisplayProps) {
  return (
    <div className="bg-[#F1F0FB] p-6 rounded-3xl">
      <h3 className="text-xl font-semibold text-[hsl(var(--attune-purple))] mb-4">Live Transcript</h3>
      <div className="bg-white p-4 rounded-xl max-h-60 overflow-y-auto shadow-inner relative">
        {transcript.length > 0 ? (
          transcript.map((text, index) => (
            <p key={index} className="py-1 border-b border-gray-100 last:border-none">
              {text}
            </p>
          ))
        ) : (
          <p className="text-gray-500 italic">Waiting for speech...</p>
        )}
        
        <LiveTranscription 
          isRecording={isRecording} 
          onTranscriptUpdate={onTranscriptUpdate} 
        />
      </div>
    </div>
  );
}
