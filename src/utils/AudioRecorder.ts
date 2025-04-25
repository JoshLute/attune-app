
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private isTranscribing = false;

  constructor(
    private onTranscription: (text: string) => void,
    private onError: (error: Error) => void
  ) {}

  async start() {
    try {
      console.log('Starting audio recording...');
      
      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Configure recorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm'
      });

      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          console.log(`Audio chunk captured: ${event.data.size} bytes`);
          
          // Skip if we're already transcribing
          if (this.isTranscribing) {
            console.log('Already transcribing, skipping chunk');
            return;
          }
          
          await this.transcribeAudio(event.data);
        }
      };

      // Record in 3-second chunks
      this.mediaRecorder.start(3000);
      console.log('Audio recording started with 3-second intervals');

    } catch (error) {
      console.error('Failed to start recording:', error);
      this.onError(error instanceof Error ? error : new Error('Failed to start recording'));
      this.cleanup();
    }
  }

  private async transcribeAudio(audioBlob: Blob) {
    try {
      this.isTranscribing = true;

      const buffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(buffer)));

      console.log('Sending audio chunk for transcription');
      
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.text && data.text.trim().length > 0) {
        console.log('Received transcription:', data.text);
        this.onTranscription(data.text);
      }

    } catch (error) {
      console.error('Transcription error:', error);
      this.onError(error instanceof Error ? error : new Error('Transcription failed'));
    } finally {
      this.isTranscribing = false;
    }
  }

  stop() {
    console.log('Stopping audio recorder...');
    this.cleanup();
  }

  private cleanup() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}
