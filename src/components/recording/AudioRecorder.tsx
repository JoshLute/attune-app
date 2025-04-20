
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { aiService } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

interface AudioRecorderProps {
  isRecording: boolean;
  onTranscriptionUpdate: (text: string) => void;
  onStop?: () => void;
}

export const AudioRecorder = ({ isRecording, onTranscriptionUpdate, onStop }: AudioRecorderProps) => {
  const { toast } = useToast();
  const [isError, setIsError] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const transcriptionIntervalRef = useRef<number | null>(null);

  // Start and stop recording based on isRecording prop
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
      if (transcriptionIntervalRef.current) {
        clearInterval(transcriptionIntervalRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      setIsError(false);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });

      mediaRecorderRef.current.start();

      // Set up interval to transcribe audio every 5 seconds
      transcriptionIntervalRef.current = setInterval(() => {
        if (audioChunksRef.current.length > 0) {
          sendAudioForTranscription();
        }
      }, 5000) as unknown as number;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setIsError(true);
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      
      // Final transcription on stop
      if (audioChunksRef.current.length > 0) {
        sendAudioForTranscription();
      }
      
      // Stop all tracks on the stream
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      // Clear the transcription interval
      if (transcriptionIntervalRef.current) {
        clearInterval(transcriptionIntervalRef.current);
        transcriptionIntervalRef.current = null;
      }

      if (onStop) {
        onStop();
      }
    }
  };

  const sendAudioForTranscription = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Reset audio chunks after sending
      audioChunksRef.current = [];
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async function() {
        const base64Audio = reader.result?.toString().split(',')[1]; // Remove data URL part
        
        if (!base64Audio) return;
        
        try {
          const result = await aiService.transcribeAudio({ audio: base64Audio });
          
          if (result && result.text) {
            onTranscriptionUpdate(result.text);
          }
        } catch (error) {
          console.error('Transcription error:', error);
        }
      };
    } catch (error) {
      console.error('Error sending audio for transcription:', error);
    }
  };

  return (
    <div className="flex items-center justify-center my-2">
      {isError ? (
        <div className="flex items-center text-red-500">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Microphone access denied</span>
        </div>
      ) : isRecording ? (
        <div className="flex items-center">
          <div className="relative mr-2">
            <Mic className="w-5 h-5 text-red-500" />
            <span className="absolute top-0 left-0 w-full h-full animate-ping bg-red-500 rounded-full opacity-50"></span>
          </div>
          <span>Recording in progress...</span>
        </div>
      ) : (
        <div className="flex items-center text-gray-500">
          <MicOff className="w-5 h-5 mr-2" />
          <span>Recording stopped</span>
        </div>
      )}
    </div>
  );
};
