
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor(
    private onTranscription: (text: string) => void,
    private onError: (error: Error) => void,
    private onDataAvailable?: (attention: number, understanding: number) => void
  ) {}

  async start() {
    try {
      console.log('Starting audio recording...');
      
      this.audioChunks = [];
      
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
        
        // Update metrics regularly for UI feedback
        if (this.onDataAvailable) {
          const attention = Math.floor(70 + Math.random() * 30);
          const understanding = Math.floor(65 + Math.random() * 35);
          this.onDataAvailable(attention, understanding);
        }
      };

      // Record in 1-second intervals to update metrics regularly
      this.mediaRecorder.start(1000);
      console.log('Audio recording started');

    } catch (error) {
      console.error('Failed to start recording:', error);
      this.onError(error instanceof Error ? error : new Error('Failed to start recording'));
      this.cleanup();
    }
  }

  async stop() {
    console.log('Stopping audio recording...');
    
    try {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        // Stop the media recorder
        this.mediaRecorder.stop();
        
        // Create a small delay to ensure all chunks are processed
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Process the full recording at the end
        await this.processFullRecording();
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.onError(error instanceof Error ? error : new Error('Error stopping recording'));
    } finally {
      this.cleanup();
    }
  }

  private async processFullRecording() {
    try {
      console.log('Processing full recording...', this.audioChunks.length, 'chunks collected');
      
      if (this.audioChunks.length === 0) {
        console.warn('No audio chunks collected');
        this.onTranscription("No audio recorded.");
        return;
      }
      
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      console.log('Audio blob size:', audioBlob.size, 'bytes');
      
      if (audioBlob.size < 100) {
        console.warn('Audio blob too small, likely no audio recorded');
        this.onTranscription("No speech detected.");
        return;
      }
      
      const buffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      
      console.log('Sending audio for transcription...', base64Audio.length, 'characters');
      
      const response = await fetch(
        'https://objlnvvnifkotxctblgd.functions.supabase.co/transcribe-audio',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iamxudnZuaWZrb3R4Y3RibGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MzcyNzgsImV4cCI6MjA2MDUxMzI3OH0.9qwOU2_CPeI-DFxyW21hcMz8wljuyg5Mju6dYyKySc0`
          },
          body: JSON.stringify({ audioData: base64Audio }),
        }
      );

      if (!response.ok) {
        console.error('Error response from transcription API:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        throw new Error(`Transcription API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.text && data.text.trim().length > 0) {
        console.log('Received transcription:', data.text);
        this.onTranscription(data.text);
      } else {
        console.warn('No transcription text received');
        this.onTranscription("No speech was detected during this recording.");
      }

    } catch (error) {
      console.error('Transcription error:', error);
      this.onError(error instanceof Error ? error : new Error('Transcription failed'));
    }
  }

  private cleanup() {
    console.log('Cleaning up audio recorder resources');
    
    if (this.mediaRecorder) {
      this.mediaRecorder = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind, track.id);
        track.stop();
      });
      this.stream = null;
    }

    this.audioChunks = [];
  }
}
