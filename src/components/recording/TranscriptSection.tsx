
import React from 'react';
import { AudioRecorder } from './AudioRecorder';

interface TranscriptSectionProps {
  transcript: string[];
  isRecording: boolean;
  onTranscriptionUpdate: (text: string) => void;
  onStopRecording?: () => void;
}

export const TranscriptSection = ({ 
  transcript, 
  isRecording, 
  onTranscriptionUpdate,
  onStopRecording 
}: TranscriptSectionProps) => {
  return (
    <div className="bg-[#F1F0FB] p-6 rounded-3xl">
      <h3 className="text-xl font-semibold text-[hsl(var(--attune-purple))] mb-4">Live Transcript</h3>
      <AudioRecorder 
        isRecording={isRecording} 
        onTranscriptionUpdate={onTranscriptionUpdate}
        onStop={onStopRecording}
      />
      <div className="bg-white p-4 rounded-xl max-h-60 overflow-y-auto shadow-inner">
        {transcript.length > 0 ? (
          transcript.map((text, index) => (
            <p key={index} className="py-1 border-b border-gray-100 last:border-none">
              {text}
            </p>
          ))
        ) : (
          <p className="text-gray-500 italic">Waiting for speech...</p>
        )}
      </div>
    </div>
  );
};
