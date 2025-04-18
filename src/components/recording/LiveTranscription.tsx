
import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  isRecording: boolean;
  onTranscriptUpdate: (text: string) => void;
}

export const LiveTranscription = ({ isRecording, onTranscriptUpdate }: Props) => {
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'error'>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  // Start recording when the component is mounted and isRecording is true
  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      stopRecording();
    }
    
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener('stop', async () => {
        await processAudio();
      });

      mediaRecorderRef.current.start();
      setStatus('recording');
      
      // Process audio at regular intervals (every 10 seconds)
      const interval = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.requestData(); // Force dataavailable event
          processAudio();
        }
      }, 10000);
      
      setRecordingInterval(interval);
    } catch (error) {
      console.error('Error starting recording:', error);
      setStatus('error');
      toast({
        title: "Recording error",
        description: "Could not access your microphone. Please check your browser permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
    
    // Stop all audio tracks
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    
    setStatus('idle');
  };

  const processAudio = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    setStatus('processing');
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      // Use the complete Supabase Edge Function URL instead of relative path
      // This URL should be your actual Supabase project URL with the function name
      const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
      const transcribeUrl = `${supabaseUrl}/functions/v1/transcribe`;
      
      console.log('Sending transcription request to:', transcribeUrl);
      
      const response = await fetch(transcribeUrl, {
        method: 'POST',
        body: formData,
        headers: {
          // No Content-Type header for FormData
          // It will be set automatically with the correct boundary
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Transcription error (${response.status}):`, errorText);
        throw new Error(`Transcription failed: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.text) {
        onTranscriptUpdate(data.text);
      }
      
      // Clear the audio chunks for the next recording
      audioChunksRef.current = [];
      
      setStatus('recording');
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast({
        title: "Transcription failed",
        description: "Could not transcribe the audio. Please check your Supabase configuration.",
        variant: "destructive"
      });
      setStatus('error');
    }
  };

  return (
    <div className="absolute top-2 right-2">
      {status === 'recording' && (
        <div className="flex items-center gap-2 bg-white p-2 rounded-full shadow-md">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs">Recording</span>
        </div>
      )}
      
      {status === 'processing' && (
        <div className="flex items-center gap-2 bg-white p-2 rounded-full shadow-md">
          <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
          <span className="text-xs">Processing</span>
        </div>
      )}
      
      {status === 'error' && (
        <div className="flex items-center gap-2 bg-white p-2 rounded-full shadow-md">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-xs">Error</span>
        </div>
      )}
    </div>
  );
};
