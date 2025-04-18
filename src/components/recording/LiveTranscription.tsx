
import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  isRecording: boolean;
  onTranscriptUpdate: (text: string) => void;
}

export const LiveTranscription = ({ isRecording, onTranscriptUpdate }: Props) => {
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
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
      setErrorMessage('');
      
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
      setErrorMessage('Microphone access error');
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
      
      // Get the Supabase URL from environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        throw new Error("VITE_SUPABASE_URL environment variable is not set");
      }
      
      const transcribeUrl = `${supabaseUrl}/functions/v1/transcribe`;
      
      console.log('Sending transcription request to:', transcribeUrl);
      console.log('Audio blob size:', audioBlob.size, 'bytes');
      
      // Add extra debugging for fetch request
      try {
        const response = await fetch(transcribeUrl, {
          method: 'POST',
          body: formData,
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Transcription error (${response.status}):`, errorText);
          throw new Error(`Transcription failed: ${response.status} ${errorText || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log('Transcription response:', data);
        
        if (data.text) {
          onTranscriptUpdate(data.text);
        } else {
          console.warn('No text in transcription response:', data);
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        throw new Error(`Network error: ${fetchError.message || 'Failed to connect to transcription service'}`);
      }
      
      // Clear the audio chunks for the next recording
      audioChunksRef.current = [];
      
      setStatus('recording');
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Unknown error');
      toast({
        title: "Transcription failed",
        description: error.message || "Could not transcribe the audio. Please check your Supabase configuration.",
        variant: "destructive"
      });
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
          <span className="text-xs">Error: {errorMessage}</span>
        </div>
      )}
    </div>
  );
};
