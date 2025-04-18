
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
  
  // Check for Supabase configuration on mount
  useEffect(() => {
    // Debug what environment variables are available
    console.log('Available Vite env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
    
    // Use optional chaining and nullish coalescing to avoid errors
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
    const supabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';
    
    console.log('VITE_SUPABASE_URL in LiveTranscription:', supabaseUrl || 'not set');
    console.log('VITE_SUPABASE_ANON_KEY in LiveTranscription configured:', !!supabaseKey);
    
    if (!supabaseUrl || !supabaseKey) {
      setStatus('error');
      setErrorMessage('Supabase configuration missing');
      toast({
        title: "Configuration Error",
        description: "Supabase environment variables are not properly configured. Please check your setup.",
        variant: "destructive"
      });
    }
  }, [toast]);
  
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
      
      // Get the Supabase URL from environment variables with safeguards
      const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
      
      // Add more explicit error handling
      if (!supabaseUrl) {
        console.error('VITE_SUPABASE_URL is missing');
        setStatus('error');
        setErrorMessage('Supabase URL not configured');
        throw new Error("Supabase URL is not configured. Please check your environment variables.");
      }
      
      const transcribeUrl = `${supabaseUrl}/functions/v1/transcribe`;
      console.log('Sending transcription request to:', transcribeUrl);
      console.log('Audio blob size:', audioBlob.size, 'bytes');
      
      const response = await fetch(transcribeUrl, {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Transcription error (${response.status}):`, errorText);
        
        // More specific error handling based on status
        switch (response.status) {
          case 401:
            throw new Error("Unauthorized. Check your Supabase and API configurations.");
          case 429:
            throw new Error("Too many requests. Please try again later.");
          case 500:
            throw new Error("Server error. The transcription service might be temporarily unavailable.");
          default:
            throw new Error(`Transcription failed: ${response.status} ${errorText || 'Unknown error'}`);
        }
      }
      
      const data = await response.json();
      console.log('Transcription response:', data);
      
      if (data.text) {
        onTranscriptUpdate(data.text);
      } else {
        console.warn('No text in transcription response:', data);
        // Optional: Show a toast if no text is returned
        toast({
          title: "Transcription Incomplete",
          description: "No text was transcribed. The audio might be too short or unclear.",
          variant: "default"
        });
      }
      
      // Clear the audio chunks for the next recording
      audioChunksRef.current = [];
      
      setStatus('recording');
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Unknown error');
      
      // More detailed toast messages for different error scenarios
      toast({
        title: "Transcription Error",
        description: error.message || "Could not transcribe the audio. Please check your configuration and try again.",
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
