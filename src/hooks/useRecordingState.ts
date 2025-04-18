
import { useState, useEffect } from 'react';

interface RecordingState {
  isRecording: boolean;
  recordingTime: number;
  understanding: number;
  attention: number;
  transcript: string[];
  activeTag: string | null;
}

export const useRecordingState = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [understanding, setUnderstanding] = useState(85);
  const [attention, setAttention] = useState(90);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Simulate changing metrics over time
      const understandingInterval = setInterval(() => {
        setUnderstanding(prev => {
          const change = Math.random() > 0.5 ? 5 : -5;
          return Math.max(10, Math.min(100, prev + change));
        });
      }, 5000);
      
      const attentionInterval = setInterval(() => {
        setAttention(prev => {
          const change = Math.random() > 0.5 ? 8 : -8;
          return Math.max(20, Math.min(100, prev + change));
        });
      }, 4000);

      return () => {
        clearInterval(timer);
        clearInterval(understandingInterval);
        clearInterval(attentionInterval);
      };
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  return {
    isRecording,
    setIsRecording,
    recordingTime,
    understanding,
    attention,
    transcript,
    setTranscript,
    activeTag,
    setActiveTag,
  };
};
