
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSpeechToText = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startRecording = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const mediaRecorder = new MediaRecorder(stream);
          const audioChunks: Blob[] = [];

          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
          };

          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const reader = new FileReader();
            
            reader.onloadend = async () => {
              const base64Audio = (reader.result as string).split(',')[1];
              
              try {
                const { data, error } = await supabase.functions.invoke('voice-to-text', {
                  body: JSON.stringify({ audio: base64Audio }),
                });

                if (error) throw error;
                setTranscription(data.text);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Transcription failed');
              }
            };
            
            reader.readAsDataURL(audioBlob);
            stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
          };

          mediaRecorder.start();
          setIsRecording(true);
          setError(null);
          resolve();
        })
        .catch(err => {
          setError('Microphone access denied');
          reject(err);
        });
    });
  }, []);

  const stopRecording = useCallback(() => {
    const mediaRecorder = navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      });
  }, []);

  return { 
    startRecording, 
    stopRecording, 
    isRecording, 
    transcription, 
    error 
  };
};
